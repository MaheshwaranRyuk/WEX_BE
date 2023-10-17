const { validationResult } = require("express-validator");
const TableBadge = require("../Collections/BadgeCollection");
const FileHandler = require("../Helpers/FileHandler");

const getBadgeDetails = async (req, res, next) => {
	try {
		if (typeof req.params.id !== "undefined") {
			await TableBadge.findOne({
				_id: req.params.id,
				is_delete: false,
			}).then(
				(response) => {
					res.status(200).json({ msg: "success", list: response });
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			const page = parseInt(req.query.page) - 1 || 0;
			const limit = parseInt(req.query.limit) || 10;

			await TableBadge.find({ is_delete: false })
				.skip(page * limit)
				.limit(limit)
				.then((response) => {
					res.status(200).json({ msg: "success", list: response, page: page + 1, limit });
				});
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const saveBadgeDetails = async (req, res, next) => {
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
			let profile_pic;
			const { name, info } = req.body;

			if (req.files) {
				let uploadedPath = __dirname + "/../../uploads/images/";
				profile_pic = await FileHandler.uploadAvatar(req, uploadedPath, "profile_pic");
			}

			ins = { name, info, profile_pic };

			const ExistingBadge = await TableBadge.find({ is_delete: false });

			if (ExistingBadge.length > 10) {
				return res.status(400).json({ msg: "The Maximum Badge Limit is 10 " });
			}

			const checkBadge = await TableBadge.find({ name });

			if (checkBadge.length > 0) {
				return res.status(400).json({ msg: "Badge is Already present with this name" });
			}

			let insert = new TableBadge(ins);
			insert.save().then(
				(response) => {
					res.status(200).json({
						msg: "Badge Details Added Successfully",
					});
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "UnAuthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const updateBadgeDetails = async (req, res, next) => {
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
			let profile_pic;
			const { name, info } = req.body;

			if (req.files) {
				let uploadedPath = __dirname + "/../../uploads/images/";
				profile_pic = await FileHandler.uploadAvatar(req, uploadedPath, "profile_pic");
			}

			ins = { name, info, profile_pic };

			const ExistingBadge = await TableBadge.find({ is_delete: false });

			if (ExistingBadge.length > 10) {
				return res.status(400).json({ msg: "The Maximum Badge Limit is 10 " });
			}

			const checkBadge = await TableBadge.find({ name });

			if (checkBadge.length > 0) {
				return res.status(400).json({ msg: "Badge is Already present with this name" });
			}

			await TableBadge.updateOne({ _id: req.params.id, is_delete: false }).then(
				(response) => {
					res.status(200).json({
						msg: "Badge Details Added Successfully",
					});
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "UnAuthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

const deleteBadgeDetails = async (req, res, next) => {
	try {
		if (req.user.role === "SUPER_ADMIN") {
			await TableBadge.updateOne(
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
					res.status(200).json({ msg: "Badge data has been successfully deleted." });
				},
				(err) => {
					res.status(500).json({ msg: err.message });
				}
			);
		} else {
			res.status(401).json({ msg: "UnAuthorized Access" });
		}
	} catch (error) {
		res.status(400).json({ msg: error.message || "An error occurred" });
	}
};

module.exports = {
	getBadgeDetails,
	saveBadgeDetails,
	updateBadgeDetails,
	deleteBadgeDetails,
};
