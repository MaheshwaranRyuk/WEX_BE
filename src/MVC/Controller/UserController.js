var UserModel = require("../Model/UserModel");
var jwt = require("jsonwebtoken");
// var Auth = require("../Helpers/Auth");
// var authorizer = require("../Helpers/Auth");


const AddApikey = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.addApikey(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};


const AddExchange = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.addExchange(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const Payment = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.payment(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};


const GetTier = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.getTierAndRole(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const ApproveMaster = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.approveMaster(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const TierUpgrade = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.tierUpgrade(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const AdminLogin = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.adminLogin(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const MasterTrader = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.masterTrader(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};


const Gauthdisable = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.gauthdisable(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const Gauthverify = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.gAuthverify(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const Gauthvalidate = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.gauthvalidate(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const Gauth = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.gAuth(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const getUserData = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.getUserData(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const saveUser = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.saveUser(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};

const updateUser = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.updateUser(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};
const deleteUser = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.deleteUser(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

// // checking is username is unique or not
const checkData = async (req, res, next) => {
  var data = await UserModel.checkData(req);
  res.status(data.statusCode).send(data);
};

const userLogin = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.userLogin(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

const userForgotPassword = async (req, res, next) => {
  var data = await UserModel.userForgotPassword(req);
  res.status(data.statusCode).send(data);
};

const userResetPassword = async (req, res, next) => {
  var data = await UserModel.userResetPassword(req);
  res.status(data.statusCode).send(data);
};

const updatePassword = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.updatePassword(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

const uploadProfilePicture = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.uploadProfilePicture(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

const generateQRCode = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.generateQRCode(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

const generateOTP = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.generateOTP(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

const verifyUser = async (req, res, next) => {
  // if ((await Auth.authorizer(req, res))) {
  var data = await UserModel.verifyUser(req);
  res.status(data.statusCode).send(data);
  // } else {
  // res.status(400).send({ msg: "invalid sessions" });
  // }
};

module.exports = {
  getUserData,
  saveUser,
  updateUser,
  deleteUser,
  checkData,
  userLogin,
  userForgotPassword,
  userResetPassword,
  updatePassword,
  uploadProfilePicture,
  generateQRCode,
  generateOTP,
  verifyUser,
  Gauth,
  Gauthverify,
  Gauthvalidate,
  Gauthdisable,
  MasterTrader,
  AdminLogin,
  TierUpgrade,
  ApproveMaster,
  GetTier,
  Payment,
  AddExchange,
  AddApikey
};
