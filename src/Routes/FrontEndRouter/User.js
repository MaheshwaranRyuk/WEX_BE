const express = require("express");
const router = express.Router();
const Controller = require("../../MVC/Controller/UserController");
const {body} = require('express-validator');
const { authorize } = require("../../utils/utils");
router.get("/", Controller.getUserData);
router.get("/:id", Controller.getUserData);
router.put("/update/:id", Controller.updateUser);
router.put("/delete/:id", Controller.deleteUser);
// checking is username is unique or not
router.post("/checkData/", Controller.checkData);
// login
router.post("/login", Controller.userLogin);
//register
router.post("/register", [
    body('username').notEmpty().withMessage('username or email field is missing'),
    body('email').notEmpty().withMessage('email field is missing'),
    body('password').notEmpty().withMessage('Password field is missing'),
    body('confirm_password').notEmpty().withMessage('Confirm Password field is missing'),
    body('ReferalCode')
],Controller.saveUser);

// verify user
router.post("/verify/:id", [
    body('otp').notEmpty().withMessage('otp field is missing')
],Controller.verifyUser);
// forgot password
router.post("/forgot-password", [
    body('email').notEmpty().withMessage('email field is missing'),
],Controller.userForgotPassword);
// reset password
router.post("/reset-password", [
    body('password').notEmpty().withMessage('Password field is missing'),
],authorize,Controller.userResetPassword);
// update password
router.post("/update-password", [
    body('password').notEmpty().withMessage('Password field is missing'),
    body('confirm_password').notEmpty().withMessage('Confirm Password field is missing'),
],authorize,Controller.updatePassword);
// upload profile picture
router.post("/uploadPFP/:id", [
    body('base64').notEmpty().withMessage('image upload is missing'),
    body('ext').notEmpty().withMessage('extension field is missing'),
    body('mimeType').notEmpty().withMessage('Type field is missing'),
    body('fileName').notEmpty().withMessage('fileName field is missing'),
    body('path').notEmpty().withMessage('Path field is missing'),
],Controller.uploadProfilePicture);
// generate otp for email verification
router.post("/verification/otp" ,Controller.generateOTP);
router.post("/api/auth/otp/generate",authorize,Controller.Gauth);
router.post("/api/balance",authorize,Controller.balance)
router.post("/api/auth/otp/verify",[
    body('token').notEmpty().withMessage('token field is missing'),
],authorize,Controller.Gauthverify);
router.post("/api/auth/otp/validate", [
    body('token').notEmpty().withMessage('token field is missing'),
],Controller.Gauthvalidate);
router.post("/api/auth/otp/disable",authorize, Controller.Gauthdisable);
router.post("/masterTrader", [
    body('base64').notEmpty().withMessage('image upload is missing'),
    body('nickname').notEmpty().withMessage('nickname field is missing'),
    body('email').notEmpty().withMessage('email field is missing'),
    body('intro').notEmpty().withMessage('intro field is missing')
],Controller.MasterTrader);
router.post("/admin", Controller.AdminLogin);
router.post("/master-approve", Controller.ApproveMaster);
router.post("/tier",[
    body('tier').notEmpty().withMessage('tier field is missing')
] ,Controller.TierUpgrade);
router.get("/tierstatus/:id",Controller.GetTier)
router.post("/add-exchange",[
    body('name').notEmpty().withMessage('name field is missing'),
    body('exchange').notEmpty().withMessage('exchange field is missing'),
    body('exchange_type').notEmpty().withMessage('exchange_type field is missing'),
    body('api_key').notEmpty().withMessage('api_Key field is missing'),
    body('secret_key').notEmpty().withMessage('secret_key field is missing')
],Controller.AddExchange)


// router.post("/update-exchange",[
//     body('password').notEmpty().withMessage('password field is missing')
// ],Controller.UpdateExchange)


// router.post("/delete-exchange",[
//     body('password').notEmpty().withMessage('password field is missing')
// ],Controller.DeleteExchange)



module.exports = router;
