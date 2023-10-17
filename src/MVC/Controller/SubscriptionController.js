const { validationResult } = require("express-validator");
const TableExchange = require("../Collections/ExchangeKeyCollection");
const TableUser = require("../Collections/UserCollection");
const TableSubscription = require("../Collections/SubscribeCollection");
const TableTier = require("../Collections/TierCollection");

const axios = require("axios");
const { default: mongoose } = require("mongoose");
const AesEncryption = require("aes-encryption");

const aes = new AesEncryption();
aes.setSecretKey(process.env.AES_SECRET);

const getUserSubscriptions = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const userID = new mongoose.Types.ObjectId(_id);
		const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 10;

		await TableUser.aggregate([
			{
				$match: { _id: userID },
			},
			{
				$lookup: {
					from: "subscriptions",
					localField: "_id",
					foreignField: "user_id",
					as: "subscriptionDetails",
				},
			},
			{
				$unwind: "$apiKeys",
			},
			{
				$skip: page * limit,
			},
			{
				$match: { is_active: true },
			},
			{
				$limit: limit,
			},
			{
				$project: {
					_id: 1,
					subscriptionDetails: 1,
				},
			},
		]).then(
			async (response) => {
				res.status(200).json({ msg: "success", list: response });
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const subscribeToMasterTrader = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const { master_trader, trade_type, exchange } = req.body;
		const userID = new mongoose.Types.ObjectId(_id);
		const masterTraderID = new mongoose.Types.ObjectId(master_trader);

		const masterTrader = await TableUser.aggregate([
			{
				$match: { _id: masterTraderID },
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
				$match: {
					// "apiKeys.trade_type": trade_type,
					"apiKeys.exchange": exchange,
					"apiKeys.is_enabled": true,
				},
			},
		]);

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

			{
				$unwind: "$apiKeys",
			},
			{
				$match: {
					// "apiKeys.trade_type": trade_type,
					"apiKeys.exchange": exchange,
					"apiKeys.is_enabled": true,
				},
			},
			{
				$project: {
					_id: 0,
					creditPoints: 1,
					tier: 1,
					apiKeys: 1,
				},
			},
		]);

		if (
			masterTrader.length === 1 &&
			userDetails.length === 1 &&
			masterTrader[0].apiKeys.trade_type !== userDetails[0].apiKeys.trade_type
		) {
			return res.status(400).json({
				msg: `To proceed, please ensure you have a valid API profile connected to ${trade_type}`,
			});
		}

		if (userDetails[0].role === "MASTER_TRADER") {
			return res.status(400).json({
				msg: `Apologies, but as a Master trader, you cannot copy trades at the moment`,
			});
		}

		const TierDetails = await TableTier.find({ name: userDetails[0].tier });

		//["BASIC", "ADVANCED", "PRO", "PREMIUM"]

		if (userDetails[0].tier === "BASIC") {
			userDetails[0].maxTradableAmount = TierDetails.overall_trade_limit;
			userDetails[0].trade_type = TierDetails.trade_type;
			userDetails[0].overall_trade_limit = TierDetails.overall_trade_limit;
		} else if (userDetails[0].tier === "ADVANCED") {
			userDetails[0].maxTradableAmount = TierDetails.overall_trade_limit;
			userDetails[0].trade_type = TierDetails.trade_type;
			userDetails[0].overall_trade_limit = TierDetails.overall_trade_limit;
		} else if (userDetails[0].tier === "PRO") {
			userDetails[0].maxTradableAmount = TierDetails.overall_trade_limit;
			userDetails[0].trade_type = TierDetails.trade_type;
			userDetails[0].overall_trade_limit = TierDetails.overall_trade_limit;
		} else {
			userDetails[0].maxTradableAmount = TierDetails.overall_trade_limit;
			userDetails[0].trade_type = TierDetails.trade_type;
			userDetails[0].overall_trade_limit = TierDetails.overall_trade_limit;
		}

		res.status(200).json({ msg: "API KEY Details", list: userDetails });
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

/**
 	first check tier
	if payment is confirmed then upgrade the tier  
 */

const upgradeTier = async (req, res, next) => {
	try {
		const { user_id } = req.body;
		const userTier = await TableUser.aggregate({
			$match: {},
		});
	} catch (error) {}
};

const popUpConfiguration = async (req, res, next) => {
	try {
		const { _id } = req.user;
		let ins;
		let user_id = _id;
		const { copy_trading_type, master_trader_id, maximum_tradable_amount, exchange_api_id } =
			req.body;

		const userDetails = await TableUser.findOne({ _id: user_id });
		if (copy_trading_type === "FIXED_AMOUNT") {
			ins = {
				copy_trading_type,
				user_id,
				master_trader_id,
				maximum_tradable_amount,
				exchange_api_id,
			};
		} else if (copy_trading_type === "CUSTOM_POSITION") {
			const { percentage_portfolio, leverage } = req.body;
			ins = {
				copy_trading_type,
				user_id,
				master_trader_id,
				maximum_tradable_amount,
				exchange_api_id,
				percentage_portfolio,
				leverage,
			};
		} else if (copy_trading_type === "CUSTOM_FIXED") {
			const { percentage_portfolio, fixed_amount, leverage } = req.body;
			ins = {
				copy_trading_type,
				user_id,
				master_trader_id,
				fixed_amount,
				exchange_api_id,
				percentage_portfolio,
				leverage,
			};
		}

		// now we have to check if tier is basic
		/**
		 * Basic 
		Advanced 
		Pro 
		Premium

		 */

		const insert = new TableSubscription(ins);
		insert.save().then(
			(response) => {
				res.status(200).json({
					msg: "Subscription Details Added successfully",
				});
			},
			(err) => {
				res.status(500).json({ msg: err.message });
			}
		);
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const unSubscribeMasterTrader = async (req, res, next) => {
	try {
		const { _id } = req.user;
		const checkUser = await TableSubscription.findOne({ user_id: _id });
		if (!checkUser) {
			return res.status(400).json({ msg: "You can not unsubscribe this order" });
		}

		await TableSubscription.updateOne(
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
				res.status(200).json({ msg: "Unsubscribed Master Trader  successfully." });
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
	getUserSubscriptions,
	subscribeToMasterTrader,
	popUpConfiguration,
	unSubscribeMasterTrader,
};
