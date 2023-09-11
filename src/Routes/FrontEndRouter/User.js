const express = require("express");
const router = express.Router();
const Controller = require("../../MVC/Controller/UserController");


router.get("/", Controller.getUserData);
router.get("/:id", Controller.getUserData);
router.post("/register", Controller.saveUser);
router.put("/update/:id", Controller.updateUser);
router.put("/delete/:id", Controller.deleteUser);

// checking is username is unique or not
router.post("/checkData/", Controller.checkData);

// login
router.post("/login", Controller.userLogin);

// forgot password
router.post("/forgot-password", Controller.userForgotPassword);

// reset password
router.post("/reset-password", Controller.userResetPassword);

// verify user
// router.get("/verify/:id", Controller.verifyUser);

// update password
router.post("/update-password/:id", Controller.updatePassword);

// upload profile picture
router.post("/uploadPFP/:id", Controller.uploadProfilePicture);

// GAuth 2 factor authentication
// for generating qr code data which will generate secret key
router.get("/gauth/generate-qrcode", Controller.generateQRCode);

// verifying secret
// router.post("/gauth/verify-secret", Controller.verifySecret);

// generate otp for email verification
router.get("/verification/otp/:id", Controller.generateOTP);

// verify user
router.post("/verify/:id", Controller.verifyUser);

router.post("/api/auth/otp/generate", Controller.Gauth);
router.post("/api/auth/otp/verify", Controller.Gauthverify);
router.post("/api/auth/otp/validate", Controller.Gauthvalidate);
router.post("/api/auth/otp/disable", Controller.Gauthdisable);


router.post("/masterTrader", Controller.MasterTrader);

router.post("/admin", Controller.AdminLogin);


router.post("/approve/:id", Controller.ApproveMaster);
router.post("/tier", Controller.TierUpgrade);
// router.post("/masterTrader/tier", Controller.TierUpgrade);



router.get("/tierstatus/:id",Controller.GetTier)

router.post("/add-exchange",Controller.AddExchange)
router.post("/add-api-key",Controller.AddApikey)


module.exports = router;
