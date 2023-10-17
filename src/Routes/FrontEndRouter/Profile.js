const express = require("express");
const Controller = require("../../MVC/Controller/ProfileController");
const { body } = require("express-validator");
const { authorize } = require("../../utils/utils");
const router = express.Router();

router.post("/update-username", authorize,Controller.updateUsername);

router.post(
	"/update-password",
	[
		body("password").notEmpty().withMessage("Password field is missing"),
		body("confirm_password").notEmpty().withMessage("Confirm Password field is missing"),
	],
	authorize,
	Controller.updatePassword
);

router.post("/update-email", authorize,Controller.updateEmail);
router.post("/verify-email", authorize,Controller.verify);

module.exports = router