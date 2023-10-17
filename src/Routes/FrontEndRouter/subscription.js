const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Controller = require("../../MVC/Controller/SubscriptionController");
const { authorize } = require("../../utils/utils");

router.get("/get-user-subscription/", authorize, Controller.getUserSubscriptions);

router.post("/subscribe-master-trader", authorize, Controller.subscribeToMasterTrader);

router.post("/popup-configuration", authorize, Controller.popUpConfiguration);

router.post("/unsubscribe/:id", authorize, Controller.unSubscribeMasterTrader);

module.exports = router;
