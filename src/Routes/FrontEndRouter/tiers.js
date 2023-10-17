const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Controller = require("../../MVC/Controller/TierController");
const { authorize } = require("../../utils/utils");

//get tier details
router.get("/get-tier-details", Controller.getTierDetails);

//register Tier Details
router.post(
	"/register-tier",
	authorize,
	body("name")
		.isIn(["BASIC", "ADVANCED", "PRO", "PREMIUM"])
		.withMessage("Type must be one of: BASIC, ADVANCED, PRO, PREMIUM"),
	body("features").notEmpty().withMessage("features value should not be blank."),
	body("description").notEmpty().withMessage("Description value should not be blank."),
	body("maximum_api_exchange")
		.notEmpty()
		.isNumeric()
		.withMessage(" Maximum API KEY field is missing"),
	body("overall_trade_limit")
		.notEmpty()
		.isNumeric()
		.withMessage(" Overall Trade Limit field is missing"),
	body("trade_type").notEmpty().withMessage("trade type requires Exchange Type"),
	Controller.registerTierDetails
);

//update Tier Details

router.post("/update-tier/:id", authorize, Controller.updateTierDetails);

//delete Tier Details
router.post("/delete-tier/:id", authorize, Controller.deleteTierDetails);

module.exports = router;
