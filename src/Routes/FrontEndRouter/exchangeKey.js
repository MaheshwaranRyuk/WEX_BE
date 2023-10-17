const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Controller = require("../../MVC/Controller/ExchangeKeyController");
const { authorize } = require("../../utils/utils");

router.get("/get-single-exchange-key/:id", Controller.getSingleExchangeKey);

// get users api key
router.get("/get-user-exchange-keys", authorize, Controller.getUserExchangeKeys);

//save api key
router.post(
	"/register-api-key",
	authorize,
	body("name")
		.notEmpty()
		.withMessage("Name value should not be blank.")
		.isLength({ min: 2, max: 50 })
		.withMessage("Name should be between 2 and 50 characters.")
		.matches(/^[a-zA-Z0-9.-]+$/)
		.withMessage('Name can only contain letters, numbers, ".", and "-".'),
	body("api_key").notEmpty().withMessage("API KEY value should not be blank."),
	body("api_secret").notEmpty().withMessage("requires secret credential"),
	body("exchange")
		.isIn(["BINANCE", "KUCOIN", "OKX"])
		.withMessage("Type must be one of: BINANCE, KUCOIN, OKX"),
	body("trade_type").notEmpty().withMessage(" requires Exchange Type"),
	Controller.registerExchangeKey
);

//update exchange key
router.post("/update-exchange-key/:id", authorize, Controller.updateExchangeKey);

//delete api key
router.post("/delete-exchange-key/:id", authorize, Controller.deleteExchangeKey);

//to change status or active or inactive
router.post("/change-exchange-key-status", authorize, Controller.changeStatusExchangeKey);

module.exports = router;
