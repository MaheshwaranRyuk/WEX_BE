const { validationResult } = require("express-validator");
const TableExchange = require("../Collections/ExchangeKeyCollection");
const TableUser = require("../Collections/UserCollection");
const TableTier = require("../Collections/TierCollection");

const axios = require("axios");
const { default: mongoose } = require("mongoose");
const AesEncryption = require("aes-encryption");
const { kuCoinVerify, okxVerify, binanceVerify } = require("../../utils/apiVerify");

const aes = new AesEncryption();
//console.log('process.env.AES_SECRET',process.env.AES_SECRET)
aes.setSecretKey(process.env.AES_SECRET);

const getSingleExchangeKey = async (req, res, next) => {
	try {
		// if (req.user.role === "SUPER_ADMIN") {
		if (typeof req.params.id !== "undefined") {
			await TableExchange.find({
				_id: req.params.id,
				is_delete: false,
			}).then(
				async (response) => {
					response[0].api_key = await aes.decrypt(response[0].api_key);
					response[0].api_secret = await aes.decrypt(response[0].api_secret);
					if (response[0].passphrase !== "" && response[0].passphrase !== undefined) {
						response[0].passphrase = await aes.decrypt(response[0].passphrase);
					}
					res.status(200).json({ msg: "success", list: response[0] });
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			const page = parseInt(req.query.page) - 1 || 0;
			const limit = parseInt(req.query.limit) || 10;

			await TableExchange.find({ is_delete: false })
				.skip(page * limit)
				.limit(limit)
				.then(async (response) => {
					const userData = await Promise.all(
						response.map(async (user) => {
							user.apiKeys.api_key = await aes.decrypt(user.apiKeys.api_key);
							user.apiKeys.api_secret = await aes.decrypt(user.apiKeys.api_secret);
							if (user.apiKeys.passphrase !== "" && user.apiKeys.passphrase !== undefined) {
								user.apiKeys.passphrase = await aes.decrypt(user.apiKeys.passphrase);
							}
							return user;
						})
					);
					res.status(200).json({ msg: "success", list: userData, page: page + 1, limit });
				});
		}
		// } else {
		// 	res.status(401).json({ msg: "UnAuthorized Access" });
		// }
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const getUserExchangeKeys = async (req, res, next) => {
	try {
		const userData = req.user;
		if (!userData || !userData._id) {
			return res.status(400).json({ msg: "No direct Access Allowed" });
		}
		const userID = new mongoose.Types.ObjectId(userData._id);
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 10;

		await TableUser.aggregate([
			{
				$match: { _id: userID },
			},
			{
				$lookup: {
					from: "exchangekeys",
					localField: "_id",
					foreignField: "user_id",
					as: "apiKeys",
				},
			},
			{
				$unwind: "$apiKeys",
			},
			{
				$skip: page * limit,
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: 1,
					apiKeys: 1,
				},
			},
		]).then(
			async (response) => {
				const userData = await Promise.all(
					response.map(async (user) => {
						user.apiKeys.api_key = await aes.decrypt(user.apiKeys.api_key);
						user.apiKeys.api_secret = await aes.decrypt(user.apiKeys.api_secret);
						if (user.apiKeys.passphrase !== "" && user.apiKeys.passphrase !== undefined) {
							user.apiKeys.passphrase = await aes.decrypt(user.apiKeys.passphrase);
						}
						return user;
					})
				);

				res.status(200).json({ msg: "success", list: userData });
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const registerExchangeKey = async (req, res, next) => {
	const result = validationResult(req);

	if (!result.isEmpty()) {
		return res.status(400).json({
			status: 400,
			message: result.array()[0].msg,
		});
	}
	try {
		let ins;
		let responseCode;
		const userData = req.user;
		if (!userData || !userData._id) {
			return res.status(400).json({ msg: "No direct Access Allowed" });
		}
		const user_id = userData._id;
		const { name, api_key, api_secret, exchange, trade_type } = req.body;
		const userID = new mongoose.Types.ObjectId(user_id);

		const userDetails = await TableUser.aggregate([
			{
				$match: { _id: userID },
			},
			{
				$lookup: {
					from: "exchangekeys",
					localField: "_id",
					foreignField: "user_id",
					as: "apiKeys",
				},
			},
		]);
		//const checkMaxAPIkey = await TableTier.findOne({ name: userDetails[0].tier });
		// if (userDetails[0].apiKeys.length <= checkMaxAPIkey.maximum_api_exchange) {
		// 	return res.status(400).json({
		// 		msg: "You've reached the API key limit for your current tier. To add more API keys, simply upgrade your tier.",
		// 	});
		// }
		const checkName = await TableExchange.find({ name: name });
		if (checkName.length > 0) {
			return res.status(400).json({ msg: "Please Enter Unique  name" });
		}
		const checkApiKey = await TableExchange.findOne({ exchange, trade_type, user_id });
		if (checkApiKey) {
			const decryptedApiKey = await aes.decrypt(checkApiKey.api_key);
			const decryptedApiSecret = await aes.decrypt(checkApiKey.api_secret);
			if (decryptedApiKey === api_key || decryptedApiSecret === api_secret) {
				return res
					.status(400)
					.json({ msg: "API key already exists for this exchange and trade type" });
			}
		}
		if (exchange === "BINANCE") {
			responseCode = await binanceVerify(api_key, api_secret);
			if (responseCode == 400 || responseCode == 401) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET",
				});
			} else if (responseCode === 200) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				ins = {
					name,
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else if (exchange === "OKX") {
			const { passphrase } = req.body;
			if (!passphrase) {
				throw new Error("passphrase field is missing");
			}
			responseCode = await okxVerify(api_key, api_secret, passphrase);
			responseCode = Number(responseCode);
			if (
				responseCode === 50113 ||
				responseCode === 50111 ||
				responseCode === 50105 ||
				responseCode === 50102
			) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET or PassPhrase",
				});
			} else if (responseCode === 0) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				const encryptedPassPhrase = await aes.encrypt(passphrase);
				ins = {
					name,
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					passphrase: encryptedPassPhrase,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else if (exchange === "KUCOIN") {
			const { passphrase } = req.body;

			if (!passphrase) {
				throw new Error("passphrase field is missing");
			}
			responseCode = await kuCoinVerify(api_key, api_secret, passphrase);
			responseCode = Number(responseCode);

			if (responseCode === 400003 || responseCode === 400004) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET",
				});
			} else if (responseCode === 200000) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				const encryptedPassPhrase = await aes.encrypt(passphrase);
				ins = {
					name,
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					passphrase: encryptedPassPhrase,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else {
			res.status(401).json({
				msg: "Invalid Exchange Type",
			});
		}

		const insert = new TableExchange(ins);
		insert.save().then(
			(response) => {
				res.status(200).json({
					msg: "API KEY Details Added successfully",
				});
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({
			msg: error.message,
		});
	}
};

const updateExchangeKey = async (req, res, next) => {
	try {
		let upd;
		let responseCode;
		const userData = req.user;
		if (!userData || !userData._id) {
			return res.status(400).json({ msg: "No direct Access Allowed" });
		}
		const user_id = userData._id;

		const checkUser = await TableExchange.findOne({ _id: req.params.id, user_id: user_id });
		if (!checkUser) {
			return res.status(400).json({ msg: "You can not update this API KEY" });
		}

		const { name, api_key, api_secret, exchange, trade_type, passphrase } = req.body;

		const checkName = await TableExchange.findOne({ name: name });

		if (checkName) {
			return res.status(400).json({ msg: "Please Enter Unique name" });
		}

		const checkApiKey = await TableExchange.findOne({ exchange, trade_type, user_id });

		if (checkApiKey) {
			const decryptedApiKey = await aes.decrypt(checkApiKey.api_key);
			const decryptedApiSecret = await aes.decrypt(checkApiKey.api_secret);

			if (decryptedApiKey === api_key || decryptedApiSecret === api_secret) {
				return res
					.status(400)
					.json({ msg: "API key already exists for this exchange and trade type" });
			}
		}
		//

		if (exchange === "BINANCE") {
			responseCode = await binanceVerify(api_key, api_secret);

			if (responseCode == 400 || responseCode == 401) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET",
				});
			} else if (responseCode === 200) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				upd = {
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else if (exchange === "OKX") {
			responseCode = await okxVerify(api_key, api_secret, passphrase);
			responseCode = Number(responseCode);
			if (
				responseCode === 50113 ||
				responseCode === 50111 ||
				responseCode === 50105 ||
				responseCode === 50102
			) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET or PassPhrase",
				});
			} else if (responseCode === 0) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				const encryptedPassPhrase = await aes.encrypt(passphrase);
				upd = {
					name,
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					passphrase: encryptedPassPhrase,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else if (exchange === "KUCOIN") {
			responseCode = await kuCoinVerify(api_key, api_secret, passphrase);
			responseCode = Number(responseCode);

			if (responseCode === 400003 || responseCode === 400004) {
				return res.status(401).json({
					msg: "Invalid API KEY OR SECRET",
				});
			} else if (responseCode === 200000) {
				const encryptedAPIKey = await aes.encrypt(api_key);
				const encryptedAPISecret = await aes.encrypt(api_secret);
				const encryptedPassPhrase = await aes.encrypt(passphrase);
				upd = {
					name,
					api_key: encryptedAPIKey,
					api_secret: encryptedAPISecret,
					passphrase: encryptedPassPhrase,
					user_id,
					exchange,
					trade_type,
				};
			}
		} else {
			res.status(401).json({
				msg: "Invalid Exchange Type",
			});
		}

		await TableExchange.updateOne(
			{
				_id: req.params.id,
				is_delete: false,
			},
			{
				$set: upd,
			}
		).then(
			(response) => {
				res.status(200).json({
					msg: "API KEY Details Updated successfully",
				});
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({
			msg: error.message,
		});
	}
};

const deleteExchangeKey = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const checkUser = await TableExchange.findOne({ _id: req.params.id, user_id: _id });
		if (!checkUser) {
			return res.status(400).json({ msg: "You can not delete this API KEY" });
		}
		await TableExchange.updateOne(
			{
				_id: req.params.id,
			},
			{
				$set: {
					is_delete: true,
				},
			}
		).then(
			(response) => {
				res.status(200).json({ msg: "Exchange Key has been successfully deleted." });
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const changeStatusExchangeKey = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const checkUser = await TableExchange.findOne({ _id: req.params.id, user_id: _id });
		if (!checkUser) {
			return res.status(400).json({ msg: "You can not Disable This API KEY" });
		}
		await TableExchange.updateOne(
			{
				_id: req.params.id,
			},
			{
				$set: {
					is_active: false,
				},
			}
		).then(
			(response) => {
				res.status(200).json({ msg: "Exchange Key has been updated successfully ." });
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

module.exports = {
	getSingleExchangeKey,
	getUserExchangeKeys,
	registerExchangeKey,
	updateExchangeKey,
	deleteExchangeKey,
	changeStatusExchangeKey,
};
