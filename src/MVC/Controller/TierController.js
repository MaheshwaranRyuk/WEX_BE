const { validationResult } = require("express-validator");
const TableTier = require("../Collections/TierCollection");

const getTierDetails = async (req, res, next) => {
	try {
		await TableTier.find({ is_delete: false }).then((response) => {
			res.status(200).json({ msg: "success", list: response });
		});
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const registerTierDetails = async (req, res, next) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({
			status: 400,
			message: result.array()[0].msg,
		});
	}

	try {
		if (req.user.role === "SUPER_ADMIN") {
			let ins;
			const {
				name,
				description,
				features,
				maximum_api_exchange,
				overall_trade_limit,
				trade_type,
				price,
			} = req.body;

			const checkName = await TableTier.find({ name: name });

			if (checkName.length > 0) {
				return res.status(400).json({ msg: "Tier Details Already Added" });
			}

			ins = {
				name,
				description,
				features,
				maximum_api_exchange,
				overall_trade_limit,
				trade_type,
				price,
			};

			const insert = new TableTier(ins);
			insert.save().then(
				(response) => {
					res.status(200).json({
						msg: "Tier Details Added successfully",
					});
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "Unauthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const updateTierDetails = async (req, res, next) => {
	try {
		if (req.user.role === "SUPER_ADMIN") {
			let upd;
			const {
				description,
				features,
				maximum_api_exchange,
				overall_trade_limit,
				trade_type,
				price,
			} = req.body;

			upd = {
				description,
				features,
				maximum_api_exchange,
				overall_trade_limit,
				trade_type,
				price,
			};

			await TableTier.updateOne(
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
						msg: "Tier Details Updated successfully",
					});
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "Unauthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const deleteTierDetails = async (req, res, next) => {
	try {
		if (req.user.role === "SUPER_ADMIN") {
			await TableTier.updateOne(
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
					res.status(200).json({ msg: "Tier has been successfully deleted." });
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "Unauthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

module.exports = {
	getTierDetails,
	registerTierDetails,
	updateTierDetails,
	deleteTierDetails,
};
