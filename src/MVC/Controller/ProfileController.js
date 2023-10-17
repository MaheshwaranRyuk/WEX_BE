const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { hashText, verifyText } = require("../../utils/utils");
const TableUser = require("../Collections/UserCollection");
const moment = require("moment");
const otpGenerator = require("otp-generator");
const { transporter } = require("../../MVC/Helpers/Mailer");

async function generateOTP(id) {
	if (id != "" && typeof id !== "undefined") {
		try {
			console.log(`requestGenerateOTP`, id);
			const user = await TableUser.findOne({ _id: id });
			console.log(`user`, user);
            
			const currentTime = moment();
			const otpExpirationTime = moment(currentTime).add(30, "minutes");

			const otp = otpGenerator.generate(6, {
				digits: true,
				lowerCaseAlphabets: false,
				upperCaseAlphabets: false,
				specialChars: false,
			});
            console.log(otp);
			user.otp = otp;
			user.otp_expire_time = otpExpirationTime;
			const resend_time = moment();
			user.otp_resend_time = resend_time;
			await user.save();

			transporter.sendMail(
				{
					from: '"Ryuk Labs 👻" <margarette.schroeder0@ethereal.email>',
					to: user.email,
					subject: " Sending OTP",
					text: "Your Verification code",
					html: `<p>OTP for email verification is ${otp}</p>`,
				},
				(error, info) => {
					if (error) {
						resultSet = {
							msg: error,
							statusCode: 400,
						};
					}
				}
			);

			resultSet = {
				msg: "success",
				statusCode: 200,
			};
			return resultSet;
		} catch (error) {
			resultSet = {
				msg: error,
				statusCode: 500,
			};
			return resultSet;
		}
	} else {
		resultSet = {
			msg: "No direct Access Allowed",
			statusCode: 500,
		};
		return resultSet;
	}
}

const updateUsername = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: result.array()[0].msg,
    });
  }
  try {
    console.log(req.user._id);
    let upd = {};
    let user = await TableUser.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Invalid user" });
    }
    upd.username = req.body.username;
    await TableUser.updateOne(
      {
        _id: req.user._id,
      },
      {
        $set: upd,
      }
    ).then(
      (result) => {
        res.status(200).json({
          msg: "User updated successfully",
          statusCode: 200,
        });
      },
      (err) => {
        res.status(500).json({
          msg: err.message,
          statusCode: 500,
        });
      }
    );
  } catch (error) {
    res.status(400).json({
      msg: error.message,
      statusCode: 400,
    });
  }
};

const updateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(`body params`, req.body);
    const user = req.user._id;

    let userDetails = await TableUser.findOne({ _id: user });
    console.log(`userDetails`, userDetails.email);

    if (!email) {
      return res.status(404).json({ message: "Email not found in the database" });
    }

    if (userDetails.email === email) {
      return res.status(400).json({ msg: "Use a different email" });
    }

    let sample = await generateOTP(userDetails._id);
    console.log(`sample`,sample);
    
    await TableUser.findByIdAndUpdate(
      { _id: req.user._id },
      { $set: { email: req.body.email, is_active: false } }
    );

    res.status(200).json({ message: "Confirmation code sent to old email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update email" });
  }
};

const verify = async (req, res, next) => {
  try {
    if (!req || typeof req.body !== "object") {
      return {
        msg: "Invalid request",
        statusCode: 400,
      };
    }

    const { otp } = req.body;

    if (!otp) {
      return {
        msg: "OTP is required",
        statusCode: 400,
      };
    }

    const user = await TableUser.findOne({ _id: req.user._id });

    if (!user) {
      return {
        msg: "Invalid OTP",
        statusCode: 404,
      };
    }

    if (user.is_active === true && user.otp === "") {
      return {
        msg: "User is already verified",
        statusCode: 200,
      };
    }

    if (user.otp !== otp) {
      return {
        msg: "Invalid OTP",
        statusCode: 400,
      };
    }

    const current_date = moment();
    const expire_time = moment(user.otp_expire_time);

    if (expire_time.isBefore(current_date)) {
      return {
        msg: "OTP has expired",
        statusCode: 400,
      };
    }

    await TableUser.findByIdAndUpdate(
      { _id: req.user._id },
      { $set: { otp: "", is_active: true } }
    );
    res.status(200).json({ msg: "User successfully verified" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Verification Failed" });
  }
};

const updatePassword = async (req, res, next) => {
  let resultSet = {};
  if (req.body && typeof req.body !== "undefined") {
    const { oldpassword, password, confirm_password } = req.body;
    try {
      const user = await TableUser.findOne({ _id: req.user._id });
      if (user) {
        const isMatch = await verifyText(oldpassword, user.password);
        if (isMatch) {
          const hashedPassword = await hashText(password);
          const hashedConfirmPassword = await hashText(confirm_password);

          await TableUser.findByIdAndUpdate(req.user._id, {
            $set: {
              password: hashedPassword,
              confirm_password: hashedConfirmPassword,
            },
          });

          resultSet = {
            msg: "Password updated successfully",
            statusCode: 200,
          };
          return res.status(200).json(resultSet);
        } else {
          resultSet = {
            msg: "Incorrect old password",
            statusCode: 400,
          };
          return res.status(400).json(resultSet);
        }
      } else {
        resultSet = {
          msg: "No user found",
          statusCode: 404,
        };
        return res.status(404).json(resultSet);
      }
    } catch (error) {
      resultSet = {
        msg: error.message,
        statusCode: 500,
      };
      return res.status(500).json(resultSet);
    }
  } else {
    resultSet = {
      msg: "No direct Access Allowed",
      statusCode: 500,
    };
    return res.status(500).json(resultSet);
  }
};



module.exports = {
  updateUsername,
  updatePassword,
  updateEmail,
  verify,
};
