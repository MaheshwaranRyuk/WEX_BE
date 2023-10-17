const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const mongoose = require("mongoose");
const Controller = require("../../MVC/Controller/MasterTraderController");
const { authorize } = require("../../utils/utils");


router.get('/get-history',authorize,Controller.getHistory)

router.post(
	"/become-master-trader",
	authorize,
	body("nickname").notEmpty().withMessage("nickname value should not be blank."),
	body("trade_style").notEmpty().withMessage("Trade Style value should not be blank."),
	body("email").notEmpty().withMessage("email value should not be blank"),
	body("bio").notEmpty().withMessage("bio value should not be blank"),
	body("api_key").custom((value) => {
		if (!mongoose.Types.ObjectId.isValid(value)) {
			throw new Error("Invalid api_key ");
		}
		return true;
	}),
	Controller.becomeMasterTrader
);

router.post(
	"/change-status/:id",
	body("status")
		.isIn(["APPROVED", "REJECTED"])
		.withMessage("Type must be one of: APPROVED, REJECTED"),
	authorize,
	Controller.changeMasterTraderStatus
);

module.exports = router;
