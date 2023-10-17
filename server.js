const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const upload = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");

const Routes = require("./src/Routes/Routes");
const EmailTemplates = require("./src/MVC/Collections/EmailTemplates");

app.use(
  cors({
    origin: "*",
  })
);
// EmailTemplates.create({
//   name:'signup_otp',
//   subject:'OTP verification',
//   body_html:"<p>OTP for email verification is {otp} </p>",
//   body_text:"Your Verification code {otp}"
// })
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(cors());
app.use(express.json());
app.use(upload());

app.use(Routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Example app listening at localhost:${PORT}`);
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Api Not Found",
  });
});
