var adminModel = require("../Model/AdminModel");

const Payment = async (req, res, next) => {
  //   if ((await Auth.authorizer(req, res))) {
  var data = await adminModel.payment(req);
  res.status(data.statusCode).send(data);
  //   } else {
  //     res.status(400).send({ msg: "invalid sessions" });
  //   }
};


module.exports = {
    Payment
}