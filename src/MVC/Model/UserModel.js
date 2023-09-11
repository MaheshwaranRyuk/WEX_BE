const con = require("../../../database/connection");
const TableUser = require("../Collections/UserCollection");
const TableExchange = require("../Collections/ExchangeCollection");
let resultSet;
const crypto = require("crypto");
const mongoose = require("mongoose");
const moment = require('moment');
const OTPAuth = require('otpauth');
const { hashText, verifyText } = require("../Helpers/Bcrypt");
const { transporter } = require("../Helpers/Mailer");
const FileHandler = require("../Helpers/FileHandler");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const otpGenerator = require("otp-generator");
var shortid = require('shortid');

const generateRandomBase32 = async () => {
  const base32Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let base32 = '';
  while (base32.length < 24) {
    const randomBytes = await crypto.randomBytes(1);
    const randomValue = randomBytes[0] % base32Characters.length;
    base32 += base32Characters.charAt(randomValue);
  }

  return base32;
};


//TODO: TAKE USER NAME FROM TOKEN
async function addExchange(req, res) {
  try {
    const { user_id,exchange,exchange_type, api_Key , Seceret_Key} = req.body;
    const user = await TableUser.findOne({ _id: user_id });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }
    const haskApikey = await hashText(api_Key)
    const haskApisecret = await hashText(Seceret_Key)
    const ins = {
      user_id,
      exchange,
      exchange_type,
      api_Key : haskApikey,
      Seceret_Key :haskApisecret
    }
    const insert = new TableExchange(ins);
    console.log(ins);
    await insert.save().then((result) => {
        console.log(result);
        resultSet = {
          msg: "Success: Your exchanges have been updated",
          statusCode: 200,
        };
      })
      .catch((err) => {
        console.log(err);
      });
    return resultSet;
  } catch (error) {
    console.log(error);
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };

    return resultSet;
  }
}

async function getTierAndRole(req, res) {
  try {
    const { user_id } = req.params;

    const user = await TableUser.findOne({ _id: user_id });
    console.log(`asddf`,user);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
        statusCode: 404,
      });
    }

    // const { tier, role } = user;

    resultSet = {
      msg: "success",
      statusCode: 200,
      tier
    };
    return resultSet;
  } catch (err) {
    resultSet = {
      msg: err,
      statusCode: 500,
    };
    return resultSet;
  }
}

async function tierUpgrade (req , res) {
  try {
    const { user_id,tier } = req.body;
    console.log( req.body);

    const user = await TableUser.findOne({ _id: user_id });
    console.log(user);
    let newTier;

    switch (tier) {
      case 1:
        newTier = "basic";
        break;
      case 2:
        newTier = "pro";
        break;
      case 3:
        newTier = "premium";
        break;
      default:
        return {
          msg: "Invalid tier request",
          statusCode: 400
        };
    }

    console.log(`newTier`,newTier);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
         { _id: user_id },
         {
          $set : {
            tier: newTier,
          },
        }).then((result) => {
          resultSet = {
                msg:  "Success: Your tier has been upgraded to " + newTier,
                statusCode: 200
          }
        }).catch((err) => {
          console.log(err);
        });
        return resultSet;
  } catch (error) {
    resultSet = {
      msg:  error.message,
      statusCode: 500
    }
    return resultSet;
  }
}

async function adminregister (request) {
  try {
    if (!request || typeof request !== "object") {
      throw new Error("Invalid request object");
    }

    const { password, confirm_password, username, email } = request.body;

    if (!password || !confirm_password || !username || !email) {
      throw new Error("Required fields are missing");
    }

    const hashedPassword = await hashText(password);
    const hashedConfirmPassword = await hashText(confirm_password);

    const ins = {
      username,
      email,
      password: hashedPassword,
      confirm_password: hashedConfirmPassword,
    };

    const insert = new TableUser(ins);
    const user = await insert.save().then(async (result) => {
        await generateOTP(result._id)
        return result._id;
    }).catch((err) => {
      console.log(err);
    });
    
    return {
      msg: "User created successfully",
      statusCode: 200,
      user: user.toString()
    };
  } catch (error) {
    return {
      msg: error.message || "An error occurred",
      statusCode: 400,
    };
  }
}

async function adminLogin(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const { usernameOrEmail, password } = request.body;

      if (!usernameOrEmail || !password) {
        resultSet = {
          msg: "All fields are required!",
          statusCode: 400,
        };
        return resultSet;
      }

      const user = await TableUser.findOne({
        is_active: true,
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });
      if (user) {
        const passwordMatch = await verifyText(password, user.password);

        if (!passwordMatch) {
          resultSet = {
            msg: "Invalid Credientials",
            statusCode: 400,
          };
          return resultSet;
        } else {
          resultSet = {
            msg: "Login Sucessfull",
            list: user,
            statusCode: 200,
          };
          return resultSet;
        }
      } else {
        resultSet = {
          msg: "No user found",
          statusCode: 400,
        };
        return resultSet;
      }
    } catch (Error) {
      resultSet = {
        msg: Error,
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

async function approveMaster(req , res) {
  try {
    const { user_id,role } = req.body;
    console.log( req.body);
    const user = await TableUser.findOne({ _id: user_id });
    console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
         { _id: user_id },
         {
          $set : {
            role: req.body.role,
            tier: "free"
          },
        }).then((result) => {
          resultSet = {
                msg: "Success : You are a Mastertrader",
                statusCode: 200
          }
        }).catch((err) => {
          console.log(err);
        });
        return resultSet;
  } catch (error) {
    resultSet = {
      msg:  error.message,
      statusCode: 500
    }
    return resultSet;
  }
}

async function masterTrader(req , res) {
  try {
    const { user_id,nickname,email,intro } = req.body;
    console.log( req.body);
    const user = await TableUser.findOne({ _id: user_id });
    console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
         { _id: user_id },
         {
          $set : {
            nickname: req.body.nickname,
            intro: req.body.intro
          },
        }).then((result) => {
          resultSet = {
                msg: "Success : Your application is under process",
                statusCode: 200
          }
        }).catch((err) => {
          console.log(err);
        });
        return resultSet;
  } catch (error) {
    resultSet = {
      msg:  error.message,
      statusCode: 500
    }
    return resultSet;
  }
};

async function gauthdisable(req , res) {
  try {
    const { user_id } = req.body;

    const user = await TableUser.findOne({ _id: user_id });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
         { _id: user_id },
         {
          $set : {
            otp_enabled: false,
          },
        }).then((result) => {
          resultSet = {
                msg: "success",
                statusCode: 200,
                otp_disabled: true
          }
        }).catch((err) => {
          console.log(err);
        });
        return resultSet;
  } catch (error) {
    resultSet = {
      msg:  error.message,
      statusCode: 500
    }
    return resultSet;
  }
};

async function gAuth(req, res) {
  let resultSet = {};
  try {
    const { user_id } = req.body;
    console.log(`body`, req.body);
    const user = await TableUser.findOne({ _id: user_id });
    console.log(`GAUTH`, user);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user with that user_id exists",
      });
    }
    let base32_secret;
    try {
      base32_secret = await generateRandomBase32();
      console.log(base32_secret);
    } catch (error) {
      console.error('Error generating random base32:', error);
    }

    let totp = new OTPAuth.TOTP({
      issuer: "codevoweb.com",
      label: "CodevoWeb",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    let otp_auth_url = totp.toString();
    console.log(`otpauth_url`, otp_auth_url);

    await TableUser.updateOne(
      { _id: user_id },
      {
        $set: {
          otp_auth_url: otp_auth_url,
          otp_base32: base32_secret,
        },
      }
    ).then((result) => {
      resultSet = {
        msg: "success",
        statusCode: 200,
        base32_secret: base32_secret,
        otp_auth_url: otp_auth_url,
        id : user_id,
        email : user.email
      };
    }).catch((err) => {
      console.log(err);
    });

    console.log(`Data stored in the database`);

    return resultSet;

  } catch (error) {
    console.error(error);
    resultSet = {
      msg: "Fail",
      statusCode: 500,
    };
    return resultSet;
  }
}

async function gAuthverify(req, res) {
  try {
    const { user_id, token } = req.body;

    const user = await TableUser.findOne({ _id: user_id });
    console.log(user);
    const message = "Token is invalid or user doesn't exist";
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }
    let totp = new OTPAuth.TOTP({
      issuer: "codevoweb.com",
      label: "CodevoWeb",
      algorithm: "SHA1",
      digits: 6,
      secret: user.otp_base32,
    });

    let delta = totp.validate({token}); 
    console.log(`dbnoaonh`,delta);
    
    if (delta === null){
      res.console.log(`Error Delta is null`);
    }
    
    const updatedUser =  await TableUser.updateOne(
      { _id: user_id },
      {
        $set: {
          otp_enabled: true,
          otp_verified: true,
        },
      }
    ).then((result) => {
      console.log(
        result
      );
      resultSet = {
        msg: "success",
        statusCode: 200,
        otp_enabled: true,
        otp_verified: true,
      };
      return resultSet;

    }).catch((err) => {
      console.log(err);
    });
    return updatedUser;

  } catch (error) {
    resultSet = {
      msg: "FAIL",
      statusCode: 500,
    };

    return resultSet;
  }
}

async function gauthvalidate(req, res) {
  try {
    const { user_id, token } = req.body;
    const user = await TableUser.findOne({  _id: user_id });
    const message = "Token is invalid or user doesn't exist";
    console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    const totp = new OTPAuth.TOTP({
      issuer: "codevoweb.com",
      label: "CodevoWeb",
      algorithm: "SHA1",
      digits: 6,
      secret: user.otp_base32,
    });

    const delta = totp.validate({ token, window: 1 });
    console.log(delta);

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }
    resultSet = {
      msg: "success",
      statusCode: 200,
      otp_valid: true,
      email : user.email
    };

    return resultSet;

  } catch (error) {
    resultSet = {
      message: error.message,
      statusCode: 500,
    };

    return resultSet;
  }

}

async function getUserData(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const User = {};
      if (typeof request.params.id !== "undefined") {
        await TableUser.find({
          _id: request.params.id,
          is_delete: false,
        }).then(
          (response) => {
            resultSet = {
              msg: "success",
              list: response,
              statusCode: 200,
            };
          },
          (err) => {
            resultSet = {
              msg: err.message,
              statusCode: 500,
            };
          }
        );
      } else {
        await TableUser.find({ is_delete: false }).then(
          (response) => {
            resultSet = {
              msg: "success",
              list: response,
              statusCode: 200,
            };
          },
          (err) => {
            resultSet = {
              msg: err.message,
              statusCode: 500,
            };
          }
        );
      }

      return resultSet;
    } catch (Error) {
      resultSet = {
        msg: Error,
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

async function saveUser(request) {
  try {
    if (!request || typeof request !== "object") {
      throw new Error("Invalid request object");
    }

    const { password, confirm_password, username, email, referralCode } = request.body;

    if (!password || !confirm_password || !username || !email) {
      throw new Error("Required fields are missing");
    }

    const hashedPassword = await hashText(password);
    const hashedConfirmPassword = await hashText(confirm_password);
    let referral_code = shortid.generate();
    console.log(`referral_code`,referral_code);
    const ins = {
      username,
      email,
      password: hashedPassword,
      confirm_password: hashedConfirmPassword,
      referralCode : referral_code
    };


    const insert = new TableUser(ins);
    const user = await insert.save().then(async (result) => {
        await generateOTP(result._id)
      return result._id;
    }).catch((err) => {
      console.log(err);
    });

    if (referralCode) {
      const referrerUser = await TableUser.findOne({ referralCode });

      if (referrerUser) {
        referrerUser.creditPoints += 5;
        await referrerUser.save();
      }

    }
    return {
      msg: "User created successfully",
      statusCode: 200,
      user: user.toString()
    };
  } catch (error) {
    return {
      msg: error.message || "An error occurred",
      statusCode: 400,
    };
  }
}

async function updateUser(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      let upd = {};

      const hashedPassword = await hashText(request.body.password);
      const hashedConfirmPassword = await hashText(
        request.body.confirm_password
      );

      upd.username = request.body.username;
      upd.email = request.body.email;
      upd.password = hashedPassword;
      upd.confirm_password = hashedConfirmPassword;

      await TableUser.updateMany(
        {
          _id: request.params.id,
        },
        {
          $set: upd,
        }
      ).then(
        (response) => {
          resultSet = {
            msg: "User updated successfully",
            statusCode: 200,
          };
        },
        (err) => {
          resultSet = {
            msg: err.message,
            statusCode: 500,
          };
        }
      );

      return resultSet;
    } catch (Error) {
      resultSet = {
        msg: Error,
        statusCode: 400,
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

async function deleteUser(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      await TableUser.updateMany(
        {
          _id: request.params.id,
        },
        {
          $set: {
            is_delete: true,
            // is_active: false,
          },
        }
      ).then(
        (response) => {
          resultSet = {
            msg: "User Deleted Successfully",
            statusCode: 200,
          };
        },
        (err) => {
          resultSet = {
            msg: err.message,
            statusCode: 500,
          };
        }
      );

      return resultSet;
    } catch (Error) {
      resultSet = {
        msg: Error,
        statusCode: 400,
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

async function checkData(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const { username, email } = request.body;

      // Check uniqueness of username
      if (username) {
        const existingUsername = await TableUser.findOne({ username });
        if (existingUsername) {
          resultSet = {
            msg: "Username not available",
            statusCode: 200,
          };
          return resultSet;
        }
      }

      // Check uniqueness of email
      if (email) {
        const existingEmail = await TableUser.findOne({ email });
        if (existingEmail) {
          resultSet = {
            msg: "Email not available",
            statusCode: 200,
          };
          return resultSet;
        }
      }

      resultSet = {
        msg: "Data is available",
        statusCode: 200,
      };

      return resultSet;
    } catch (Error) {
      resultSet = {
        msg: Error,
        statusCode: 400,
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

async function userLogin(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const { usernameOrEmail, password } = request.body;

      if (!usernameOrEmail || !password) {
        resultSet = {
          msg: "All fields are required!",
          statusCode: 400,
        };
        return resultSet;
      }

      const user = await TableUser.findOne({
        is_active: true,
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });
      if (user) {
        const passwordMatch = await verifyText(password, user.password);

        if (!passwordMatch) {
          resultSet = {
            msg: "Invalid Credientials",
            statusCode: 400,
          };
          return resultSet;
        } else {
          resultSet = {
            msg: "Login Sucessfull",
            list: user,
            statusCode: 200,
          };
          return resultSet;
        }
      } else {
        resultSet = {
          msg: "No user found",
          statusCode: 400,
        };
        return resultSet;
      }
    } catch (Error) {
      resultSet = {
        msg: Error,
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

async function userForgotPassword(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const { email } = request.body;
      if (!email) {
        resultSet = {
          msg: "Email is required!",
          statusCode: 400,
        };
        return resultSet;
      }

      const user = await TableUser.findOne({ email });
      console.log(`user`,user._id);
      if (user) {
        const token = user._id;
        await TableUser.updateOne({ email }, { $set: { token } });

        await transporter.sendMail(
          {
            from: '"Ryuk Labs 👻" <margarette.schroeder0@ethereal.email>',
            to: user.email,
            subject: "For password reset",
            text: "Reset Your Password",
            html: `<p>You can change your password by clicking on <a style="color:blue;" href=http://localhost:5173/reset-password?token=${token}>this link</a>. </p>`,
          },
          (error, info) => {
            if (error) {
              resultSet = {
                msg: error,
                statusCode: 400,
              };
              return resultSet;
            }
          }
        );
        resultSet = {
          msg: "Sucess",
          statusCode: 200,
          id : user._id
        };
        return resultSet;
      } else {
        resultSet = {
          msg: "Email is not registered",
          statusCode: 404,
        };
        return resultSet;
      }
    } catch (Error) {
      resultSet = {
        msg: Error,
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

async function userResetPassword(request) {
  let resultSet = {};
  try {
    if (request && request.params && request.params.id && request.body && request.body.password) {
      const user = await TableUser.findOne({ _id: request.params.id, is_delete: false });
      console.log(`user`, user);
      if (user) {
        const hashedPassword = await hashText(request.body.password);
        const updatedUser = await TableUser.findByIdAndUpdate(
          user._id,
          { password: hashedPassword },
          { new: true }
        );
        if (updatedUser) {
          resultSet = {
            msg: "Password reset successfully",
            statusCode: 200,
          };
        } else {
          resultSet = {
            msg: "Password update failed",
            statusCode: 500,
          };
        }
      } else {
        resultSet = {
          msg: "This link has expired",
          statusCode: 404, // Change to a more appropriate status code
        };
      }
    } else {
      resultSet = {
        msg: "Invalid request data",
        statusCode: 400, // Bad Request
      };
    }
  } catch (error) {
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };
  }
  return resultSet;
}

async function updatePassword(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const { old_password, password, confirm_password } = request.body;

      const user = await TableUser.findOne({
        _id: request.params.id,
        // is_active: true,
      });

      const isMatched = await verifyText(old_password, user.password);

      if (user && isMatched) {
        const hashedPassword = await hashText(password);
        const hashedConfirmPassword = await hashText(confirm_password);

        await TableUser.findByIdAndUpdate(
          {
            _id: request.params.id,
          },
          {
            $set: {
              password: hashedPassword,
              confirm_password: hashedConfirmPassword,
            },
          }
        );

        resultSet = {
          msg: "sucess",
          statusCode: 200,
        };
        return resultSet;
      } else {
        resultSet = {
          msg: "No user found",
          statusCode: 404,
        };
        return resultSet;
      }
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

async function uploadProfilePicture(request) {
  if (request != "" && typeof request !== "undefined") {
    try {
      const user = await TableUser.findOne({ _id: request.params.id });

      if (user) {
        if (request.files) {
          uploadpath = __dirname + "/../../uploads/images/";
          user.userProfilePicture = await FileHandler.uploadAvatar(
            request,
            uploadpath,
            "userProfilePicture"
          );

          await user.save();

          resultSet = {
            msg: "Profile picture uploaded sucessfully",
            statusCode: 200,
          };
        } else {
          resultSet = {
            msg: "no picture found",
            statusCode: 400,
          };
        }
        return resultSet;
      } else {
        resultSet = {
          msg: "no user found",
          statusCode: 404,
        };
        return resultSet;
      }
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

async function generateOTP(id) {
  if (id != "" && typeof id !== "undefined") {
    try {
      console.log(`requestGenerateOTP`, id);
      const user = await TableUser.findOne({ _id: id });
      console.log(`user`, user);
      
      const currentTime = moment(); 
      const otpExpirationTime = moment(currentTime).add(30, 'minutes'); 
      
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      user.otp = otp;
      user.otpExpiration = otpExpirationTime; 
      await user.save();
      
      await transporter.sendMail(
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

let generatedSecret = null;

async function generateQRCode(request) {
    if (request != "" && typeof request !== "undefined") {
      try {
        let generatedSecret = speakeasy.generateSecret({
          name: "thisisWeXTradebackendcode",
        });
        console.log(generatedSecret);
        const data = await new Promise((resolve, reject) => {
          qrcode.toDataURL(generatedSecret.otpauth_url, (err, data) => {
            if (err) {
              let resultSet = {
                msg: "error while generating qr",
                statusCode: 400,
              };
              reject(resultSet);
            } else {
              let resultSet = {
                msg: "qr created",
                data,
                statusCode: 200,
              };
              resolve(resultSet);
            }
          });
        });
        return data;
      } catch (error) {
        let resultSet = {
          msg: error,
          statusCode: 500,
        };
        return resultSet;
      }
    } else {
      let resultSet = {
        msg: "No direct Access Allowed",
        statusCode: 500,
      };
      return resultSet;
    }
}

// async function verifyUser(request) {
//   try {
//     if (!request || typeof request.body !== 'object') {
//       return {
//         msg: 'Invalid request',
//         statusCode: 400,
//       };
//     }

//     const { otp } = request.body;
    
//     // Find the user by ID and OTP
//     const user = await TableUser.findOne({ _id: request.params.id, otp });

//     if (!user) {
//       return {
//         msg: 'Invalid OTP',
//         statusCode: 400,
//       };
//     }

//     // Update the user's isActive field to true
//     await TableUser.updateOne({ _id: request.params.id }, { $set: { isActive: true } });

//     return {
//       msg: 'Successfully verified',
//       statusCode: 200,
//     };
//   } catch (error) {
//     return {
//       msg: error.message || 'An error occurred',
//       statusCode: 500,
//     };
//   }
// }

async function verifyUser(request) {
  try {
    // Check if the request is valid
    if (!request || typeof request.body !== 'object') {
      return {
        msg: 'Invalid request',
        statusCode: 400,
      };
    }

    const { otp } = request.body;
    console.log(request.body);

    if (!otp) {
      return {
        msg: 'OTP are required',
        statusCode: 400,
      };
    }

    const user = await TableUser.findOne({ _id: request.params.id, otp });

    if (!user) {
      return {
        msg: 'No user found',
        statusCode: 404,
      };
    }

    

    // if (!user.generatedSecret) {
    //   return {
    //     msg: 'Secret not generated',
    //     statusCode: 400,
    //   };
    // }


    // const verifiedSecret = speakeasy.totp.verify({
    //   secret: user.generatedSecret.ascii,
    //   encoding: 'ascii',
    //   token,
    // });

    // if (!verifiedSecret) {
    //   return {
    //     msg: 'OTP verification failed',
    //     statusCode: 401,
    //   };
    // }

    await TableUser.findByIdAndUpdate(
      { _id: request.params.id },
      { $set: { otp: '' } }
    );

    await TableUser.findByIdAndUpdate(
      { _id: request.params.id },
      { $set: { is_active: 'true' } }
    );

    await TableUser.findByIdAndUpdate(
      { _id: request.params.id },
      { $set: { role: 'trader' } }
    ); 
    
    await TableUser.findByIdAndUpdate(
      { _id: request.params.id },
      { $set: { tier: 'free' } }
    ); 

    return {
      msg: 'Success',
      data: otp,
      statusCode: 200,
    };
  } catch (error) {
    return {
      msg: error.message || 'Internal server error',
      statusCode: 500,
    };
  }
}


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
  generateOTP,
  generateQRCode,
  verifyUser,
  gAuth,
  gAuthverify,
  gauthvalidate,
  gauthdisable,
  masterTrader,
  adminLogin,
  tierUpgrade,
  approveMaster,
  getTierAndRole,
  addExchange,
};
