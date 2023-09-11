const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.forwardemail.net",
//   port: 465,
//   auth: { 
//     user: "luella1@ethereal.email",
//     pass: "ymQV7PC8TxKrAnqY8d",
//   },
// });

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  service: "Gmail",
  auth: {
    user: 'maheshwaran.ramesh@nextgentm.com',
    pass: 'Mahesh@98',
  },
});

module.exports = { transporter };
