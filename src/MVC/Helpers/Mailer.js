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
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d0ec591f283074",
    pass: "487cb5c2e93472"
  }
});


module.exports = { transporter };
