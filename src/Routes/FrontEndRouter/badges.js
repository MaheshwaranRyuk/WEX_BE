const express = require("express");
const { body } = require("express-validator");
const Controller = require("../../MVC/Controller/BadgeController");
const { authorize } = require("../../utils/utils");

const router = express.Router();

//get single badge
router.get("/get-badge/:id", Controller.getBadgeDetails);

//get all badges
router.get("/get-badge", Controller.getBadgeDetails);

// save badge data
router.post(
	"/save-badge-details",
	authorize,
	body("name").notEmpty().withMessage("Name Field is Missing"),
	body("info").notEmpty().withMessage("Info Field is Missing"),

	Controller.saveBadgeDetails
);

//update badge
router.post("/update-badge-details/:id", authorize, Controller.updateBadgeDetails);

//delete badge
router.post("/delete-badge/:id", authorize, Controller.deleteBadgeDetails);

module.exports = router;
