const con = require("../../../database/connection");
const TableUser = require("../Collections/UserCollection");
const TableExchange = require("../Collections/ExchangeCollection");
let resultSet;
const crypto = require("crypto");
const mongoose = require("mongoose");
const moment = require("moment");
const OTPAuth = require("otpauth");
const { hashText, verifyText } = require("../Helpers/Bcrypt");
const { transporter } = require("../Helpers/Mailer");
const FileHandler = require("../Helpers/FileHandler");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const otpGenerator = require("otp-generator");
var shortid = require("shortid");
const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION = 2 * 60 * 60 * 1000;
const AesEncryption = require("aes-encryption");
const jwt = require("jsonwebtoken");
const { error } = require("console");
const EmailTemplates = require("../Collections/EmailTemplates");
const ExchangeKeyCollection = require("../Collections/ExchangeKeyCollection");
const {
  getKucoinClient,
  getKucoinTradingHistory,
} = require("../../utils/kucoin_utils");
const { MasterTrader } = require("../Controller/UserController");
const MasterTraderCollection = require("../Collections/MasterTraderCollection");
const MasterTraderHistoryCollection = require("../Collections/MasterTraderHistoryCollection");
// const aesEncryption = require("aes-encryption");
// const aes = new AesEncryption()
// aes.setSecretKey('11122233344455566677788822244455555555555555555231231321313aaaff')
const generateRandomBase32 = async () => {
  const base32Characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let base32 = "";
  while (base32.length < 24) {
    const randomBytes = await crypto.randomBytes(1);
    const randomValue = randomBytes[0] % base32Characters.length;
    base32 += base32Characters.charAt(randomValue);
  }
  return base32;
};
async function generateReferralLink(referralCode) {
  const baseUrl = `https://wexTrade.com/register/?refralcode=${referralCode}`;
  return baseUrl;
}
// async function addExchange(req, res) {
//   try {
//     const { user_id,exchange,exchange_type, api_Key , Seceret_Key} = req.body;
//     const user = await TableUser.findOne({ _id: user_id });
//     if (!user) {
//       return res.status(401).json({
//         status: "fail",
//         message: "User doesn't exist",
//       });
//     }
//     const encrpytAPI = await aes.encrypt(api_Key)
//     const encryptSecret = await aes.encrypt(Seceret_Key)

//     const ins = {
//       user_id,
//       exchange,
//       exchange_type,
//       api_Key : encrpytAPI,
//       Seceret_Key :encryptSecret
//     }
//     const insert = new TableExchange(ins);
//     console.log(ins);
//     await insert.save().then((result) => {
//         console.log(result);
//         resultSet = {
//           msg: "Success: Your exchanges have been updated",
//           statusCode: 200,
//         };
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//     return resultSet;
//   } catch (error) {
//     console.log(error);
//     resultSet = {
//       msg: error.message,
//       statusCode: 500,
//     };

//     return resultSet;
//   }
// }
async function addExchange(req, res) {
  let resultSet; // Declare the resultSet variable
  try {
    const { user_id, name, exchange, exchange_type, api_key, secret_key } =
      req.body;
    const user = await TableUser.findOne({ _id: user_id });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }
    let maxApiKeysAllowed;
    switch (user.tier) {
      case "basic":
        maxApiKeysAllowed = 3;
        break;
      case "pro":
        maxApiKeysAllowed = 5;
        break;
      case "premium":
        maxApiKeysAllowed = 10;
        break;
      default:
        maxApiKeysAllowed = 1;
        break;
    }
    const userApiKeysCount = await TableExchange.countDocuments({ user_id });
    if (userApiKeysCount >= maxApiKeysAllowed) {
      return res.status(400).json({
        status: "fail",
        message:
          "You have exceeded the maximum number of API keys allowed for your subscription tier.",
      });
    }
    const encrpytAPI = await aes.encrypt(api_key);
    const encryptSecret = await aes.encrypt(secret_key);
    const ins = {
      user_id,
      name,
      exchange,
      exchange_type,
      api_key: encrpytAPI,
      secret_key: encryptSecret,
    };
    const insert = new ExchangeKeyCollection(ins);
    await insert
      .save()
      .then((result) => {
        // console.log(`res`, result);
        // console.log(result);
        resultSet = {
          msg: "Success: Your exchanges have been updated",
          statusCode: 200,
        };
      })
      .catch((err) => {
        // console.log(err);
      });
    return resultSet;
  } catch (error) {
    // console.log(error);
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };
    return resultSet;
  }
}
async function updateExchange(req, res) {
  try {
    const { user_id, password_confirmation, updateFields } = req.body;
    const user = await TableUser.findOne({ _id: user_id });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }
    const isPasswordValid = await verifyText(
      password_confirmation,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password confirmation",
      });
    }
    const updateObject = {};
    if (updateFields.name) {
      updateObject.name = updateFields.name;
    }
    if (updateFields.exchange) {
      updateObject.exchange = updateFields.exchange;
    }
    if (updateFields.exchange_type) {
      updateObject.exchange_type = updateFields.exchange_type;
    }
    if (updateFields.api_Key) {
      const encrpytAPI = await aes.encrypt(updateFields.api_Key);
      updateObject.api_Key = encrpytAPI;
    }
    if (updateFields.Seceret_Key) {
      const encryptSecret = await aes.encrypt(updateFields.Seceret_Key);
      updateObject.secret_key = encryptSecret;
    }
    await TableExchange.updateOne({ user_id }, { $set: updateObject });
    return res.status(200).json({
      status: "success",
      message: "Exchange updated successfully",
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function deleteExchange(req, res) {
  try {
    const { user_id, password_confirmation, name } = req.body;
    const user = await TableUser.findOne({ _id: user_id });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const isPasswordValid = await verifyText(
      password_confirmation,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password confirmation",
      });
    }

    const exchange = await TableExchange.findOne({ _id: exchangeId, user_id });

    if (!exchange) {
      return res.status(404).json({
        status: "fail",
        message: "Exchange not found or doesn't belong to the user",
      });
    }

    await TableExchange.deleteOne({ _id: name });

    return res.status(200).json({
      status: "success",
      message: "Exchange deleted successfully",
    });
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

async function getTierAndRole(req, res) {
  try {
    const { user_id } = req.params;

    const user = await TableUser.findOne({ _id: user_id });
    // console.log(`asddf`, user);

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
      tier,
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

async function tierUpgrade(req, res) {
  try {
    const { user_id, tier } = req.body;
    // console.log(req.body);

    const user = await TableUser.findOne({ _id: user_id });
    // console.log(user);
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
          statusCode: 400,
        };
    }

    // console.log(`newTier`, newTier);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
      { _id: user_id },
      {
        $set: {
          tier: newTier,
        },
      }
    )
      .then((result) => {
        resultSet = {
          msg: "Success: Your tier has been upgraded to " + newTier,
          statusCode: 200,
        };
      })
      .catch((err) => {
        // console.log(err);
      });
    return resultSet;
  } catch (error) {
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };
    return resultSet;
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
async function approveMaster(req, res) {
  try {
    const { master_id } = req.body;
    //console.log(req.body);
    const master = await MasterTraderCollection.findOne({ _id: master_id });
    if (!master) {
      return (resultSet = {
        msg: "master trader doesn't exist",
        statusCode: 200,
      });
    }
    const user = await TableUser.findOne({ _id: master.user_id });
    //console.log(user);
    if (!user) {
      return (resultSet = {
        msg: "User doesn't exist",
        statusCode: 200,
      });
    }
    await TableUser.updateOne(
      { _id: master.user_id },
      {
        $set: {
          role: "Master_Trader",
          tier: "free",
        },
      }
    )
      .then((result) => {
        resultSet = {
          msg: "Success : You are a Mastertrader",
          statusCode: 200,
        };
      })
      .catch((err) => {
        // console.log(err);
      });
    const aes = new AesEncryption();
    // console.log(req.params);
    aes.setSecretKey(process.env.AES_SECRET);
    const exchanges = await ExchangeKeyCollection.findOne({
      _id: master.api_key,
    });
    let { exchange, passphrase, api_key, api_secret, trade_type } = exchanges;

    if (exchange == "KUCOIN" && trade_type == "spot") {
      passphrase = await aes.decrypt(passphrase);
      api_key = await aes.decrypt(api_key);
      api_secret = await aes.decrypt(api_secret);
      createKucoinSocket(api_key, api_secret, passphrase);
      const kucoin = getKucoinClient(api_key, api_secret, passphrase);
      const history = await getKucoinTradingHistory(kucoin);
      if (history.code === "200000") {
        const data = history.data.items;
        const h_data = [];
        data.forEach((d) => {
          const trade_id = d.id;
          const symbol = d.symbol;
          const exchange_type = "KUCOIN";
          const side = d.side;
          const date_trade = d.createdAt;
          const amount = d.funds;
          h_data.push({
            trade_id,
            symbol,
            exchange_type,
            side,
            date_trade,
            amount,
            master_id,
          });
        });
        MasterTraderHistoryCollection.insertMany(h_data);
      }
    } else if (exchange == "OKX" && trade_type == "spot") {
      passphrase = await aes.decrypt(passphrase);
      api_key = await aes.decrypt(api_key);
      api_secret = await aes.decrypt(api_secret);
    console.log(exchange, passphrase, api_key, api_secret, trade_type,"pppppppppppppppp");

      // createKucoinSocket(api_key, api_secret, passphrase);
      const symbol = "BTC-USDT";

      const user = getOKXClient(api_key, api_secret, passphrase);
      const history = await user
        .getOrderHistory({ instId: symbol, instType: "SPOT" });
        // .then((orderHistory) => {
        //   // calculateTradeStatistics(orderHistory);
        // })
        // .catch((error) => {
        // });
        // console.log(history,"mmmmmmmmm");
      if (history.length > 0) {
        const data = history;
        const h_data = [];
        data.forEach((d) => {
          const trade_id = d.tradeId;
          const symbol = d.instId;
          const exchange_type = "OKX";
          const side = d.side;
          const date_trade = d.createdAt;
          const amount = Number(d.fillSz) * Number(d.fillPx);
          h_data.push({
            trade_id,
            symbol,
            exchange_type,
            side,
            date_trade,
            amount,
            master_id,
          });
        });
        MasterTraderHistoryCollection.insertMany(h_data);
      }
    }

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
const getOKXClient = (key, secret, passphrase) => {
  const { RestClient } = require("okx-api");
  const client = new RestClient({
    apiKey: key,
    apiSecret: secret,
    apiPass: passphrase,
  });

  return client;
};
const calculateTradeStatistics = (trades) => {
  const tradeStats = {};
  trades.forEach((trade) => {
    const symbol = trade.instId;
    const side = trade.side;
    const dealFunds = Number(trade.fillSz) * Number(trade.fillPx);
    const fee = Math.abs(Number(trade.fee));

    if (!tradeStats[symbol]) {
      tradeStats[symbol] = {
        buyTotal: 0,
        sellTotal: 0,
        feeTotal: 0,
        pnl: 0,
        roi: 0,
        verdict: "",
      };
    }

    if (side === "buy") {
      tradeStats[symbol].buyTotal += dealFunds;
    } else if (side === "sell") {
      tradeStats[symbol].sellTotal += dealFunds;
    }

    tradeStats[symbol].feeTotal += fee;

    const totalBuy = tradeStats[symbol].buyTotal;
    const totalSell = tradeStats[symbol].sellTotal;
    const totalFee = tradeStats[symbol].feeTotal;

    const pnl = totalSell - totalBuy - totalFee;
    const roi = (totalSell / totalBuy - 1) * 100;

    tradeStats[symbol].pnl = pnl.toFixed(8);
    tradeStats[symbol].roi = roi.toFixed(2) + "%";
    tradeStats[symbol].verdict = pnl <= 0 ? "LOSS" : "PROFIT";
  });
  // console.log(tradeStats);
  return tradeStats;
};

const createKucoinSocket = (key, secret, passphrase, master_id) => {
  const api = require("kucoin-node-api");
  const config = {
    apiKey: key,
    secretKey: secret,
    passphrase: passphrase,
    environment: "live",
  };

  api.init(config);
  api.initSocket({ topic: "orders" }, (msg) => {
    let data = JSON.parse(msg);
    if (data.type !== "message") {
      return;
    }
    //console.log('data',data)
    //return
    // console.log(data, data.type == "message");
    const order_id = data.data.orderId;
    const i = orders.indexOf(order_id);
    if (i == -1) {
      orders.push(order_id);
    } else {
      return;
    }
    //limit
    if (data.type == "message" && data.data.orderType == "limit") {
      // console.log("limit", data.data.type);
      if (data.data.type == "open") {
        if (subscriber) {
          // console.log("sub");
          var ord = {};
          if (data.data.side == "buy") {
            ord = {
              clientOid: uuidv4(),
              side: data.data.side,
              symbol: data.data.symbol,
              type: data.data.orderType,
              price: data.data.price,
              size: data.data.size,
            };
          } else {
            ord = {
              clientOid: uuidv4(),
              side: data.data.side,
              symbol: data.data.symbol,
              type: data.data.orderType,
              price: data.data.price,
              size: data.data.size,
            };
          }
          subscriber.rest.Trade.Orders.postOrder(ord)
            .then((c) => {
              // console.log(c);
              // console.log("[ORDER_PLACED] for subscriber");
            })
            .catch((e) => {
              // console.log(e);
              // console.log("[ORDER_ERROR] for subscriber");
            });
        }
      }
    }
    //SPOT market
    if (data.type == "message" && data.data.orderType == "market") {
      if (subscriber) {
        var ord = {};
        if (data.data.side == "buy") {
          ord = {
            clientOid: uuidv4(),
            side: data.data.side,
            symbol: data.data.symbol,
            type: data.data.orderType,
            funds: data.data.funds,
          };
        } else {
          ord = {
            clientOid: uuidv4(),
            side: data.data.side,
            symbol: data.data.symbol,
            type: data.data.orderType,
            size: data.data.size,
          };
        }
        subscriber.rest.Trade.Orders.postOrder(ord)
          .then((c) => {
            // console.log(c);
            // console.log("[ORDER_PLACED] for subscriber");
          })
          .catch((e) => {
            // console.log(e);
            // console.log("[ORDER_ERROR] for subscriber");
          });
      }
    }
    // console.log(data);
  });
};

async function masterTrader(req, res) {
  try {
    const { user_id, nickname, email, intro } = req.body;
    // console.log(req.body);
    const user = await TableUser.findOne({ _id: user_id });
    // console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    const updatedUser = await TableUser.updateOne(
      { _id: user_id },
      {
        $set: {
          nickname: req.body.nickname,
          intro: req.body.intro,
        },
      }
    )
      .then((result) => {
        resultSet = {
          msg: "Success : Your application is under process",
          statusCode: 200,
        };
      })
      .catch((err) => {
        // console.log(err);
      });
    return resultSet;
  } catch (error) {
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };
    return resultSet;
  }
}

async function gauthdisable(req, res) {
  const { _id } = req.user;
  try {
    const user_id = _id;

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
        $set: {
          gauth_enabled: false,
        },
      }
    )
      .then((result) => {
        resultSet = {
          msg: "User successfully disable 2FA",
          statusCode: 200,
          gauth_enabled: false,
        };
      })
      .catch((err) => {
        // console.log(err);
      });
    return resultSet;
  } catch (error) {
    resultSet = {
      msg: error.message,
      statusCode: 500,
    };
    return resultSet;
  }
}

async function gAuth(req, res) {
  const { _id } = req.user;
  let resultSet = {};
  try {
    // const { user_id } = req.body;
    // console.log(`body`, req.body);
    const user = await TableUser.findOne({ _id: _id });
    // console.log(`GAUTH`, user);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user with that user_id exists",
      });
    }
    let base32_secret;
    try {
      base32_secret = await generateRandomBase32();
      // console.log(base32_secret);
    } catch (error) {
      // console.error("Error generating random base32:", error);
    }

    let totp = new OTPAuth.TOTP({
      issuer: "codevoweb.com",
      label: "CodevoWeb",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    let otp_auth_url = totp.toString();
    // console.log(`otpauth_url`, otp_auth_url);

    await TableUser.updateOne(
      { _id: _id },
      {
        $set: {
          gauth_auth_url: otp_auth_url,
          gauth_base32: base32_secret,
        },
      }
    )
      .then((result) => {
        resultSet = {
          msg: "User successfully enabled 2FA",
          statusCode: 200,
          base32_secret: base32_secret,
          otp_auth_url: otp_auth_url,
          id: _id,
          email: user.email,
        };
      })
      .catch((err) => {
        // console.log(err);
      });

    // console.log(`Data stored in the database`);

    return resultSet;
  } catch (error) {
    // console.error(error);
    resultSet = {
      msg: "Fail",
      statusCode: 500,
    };
    return resultSet;
  }
}

async function gAuthverify(req, res) {
  let resultSet = {};
  const { _id } = req.user;
  try {
    const { user_id, token } = req.body;
    // console.log("req.bodu", req.body);
    const user = await TableUser.findOne({ _id: _id });
    // console.log(user);
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
      secret: user.gauth_base32,
    });
    // console.log(`hoacib`);

    let delta = totp.validate({ token });
    // console.log(`dbnoaonh`, delta);

    if (delta === null) {
      resultSet = {
        msg: "Invalid 2FA",
        statusCode: 400,
      };
      return resultSet;
    }

    const updatedUser = await TableUser.updateOne(
      { _id: _id },
      {
        $set: {
          gauth_enabled: true,
          gauth_verified: true,
        },
      }
    )
      .then((result) => {
        // console.log(result);
        resultSet = {
          msg: "User successfully verified 2FA",
          statusCode: 200,
          otp_enabled: true,
          otp_verified: true,
        };
        return resultSet;
      })
      .catch((err) => {
        // console.log(err);
      });
    return updatedUser;
  } catch (error) {
    // console.log("error", error);
    resultSet = {
      msg: "FAIL",
      statusCode: 500,
    };

    return resultSet;
  }
}

async function gauthvalidate(req, res) {
  try {
    const { usernameOrEmail, password, token } = req.body;
    const user = await TableUser.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    const message = "Token is invalid or user doesn't exist";
    // console.log(user);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }
    const passwordMatch = await verifyText(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status: "fail",
        message: "invalid user or password",
      });
    }

    const totp = new OTPAuth.TOTP({
      issuer: "codevoweb.com",
      label: "CodevoWeb",
      algorithm: "SHA1",
      digits: 6,
      secret: user.gauth_base32,
    });

    const delta = totp.validate({ token, window: 1 });
    // console.log(delta);

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }
    const jwt_token = jwt.sign(
      {
        _id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const expire = jwt.sign(
      {
        _id: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );
    resultSet = {
      msg: "Login Successful",
      token: jwt_token,
      expire,
      statusCode: 200,
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

    const { password, confirm_password, username, email, referralCode } =
      request.body;

    const is_exists = await TableUser.findOne({
      $or: [{ email }, { username }],
    });
    if (is_exists) {
      return {
        msg: "username or email already exists",
        statusCode: 400,
      };
    }

    if (!password || !confirm_password || !username || !email) {
      throw new Error("Required fields are missing");
    }

    const hashedPassword = await hashText(password);
    const hashedConfirmPassword = await hashText(confirm_password);
    let referral_code = shortid.generate();
    const referralLink = await generateReferralLink(referral_code);
    const ins = {
      username,
      email,
      password: hashedPassword,
      confirm_password: hashedConfirmPassword,
      referralCode: referral_code,
      referrallink: referralLink,
    };

    const insert = new TableUser(ins);
    const user = await insert
      .save()
      .then(async (result) => {
        await generateOTP(result._id);
        return result._id;
      })
      .catch((err) => {
        // console.log(err);
      });
    if (referralCode) {
      const referrerUser = await TableUser.findOne({ referralCode });
      if (referrerUser) {
        referrerUser.creditPoints += 1;
        await referrerUser.save();
      }
    }
    return {
      msg: "User created successfully",
      statusCode: 200,
      user: user.toString(),
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
            is_active: false,
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
      var user = await TableUser.findOne({
        is_active: true,
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });
      if (user) {
        if (user.account_locked) {
          const current_time = moment();
          const locked_date = moment(user.login_block_date);
          if (locked_date.isBefore(current_time)) {
            user.account_locked = false;
            user.num_of_login_attempt = 0;
            await user.save();
          }
        }
        if (
          user.num_of_login_attempt >= MAX_LOGIN_ATTEMPTS ||
          user.account_locked
        ) {
          resultSet = {
            msg: "Account is temporarily blocked due to multiple incorrect login attempts. Please try again later.",
            statusCode: 403,
          };
          return resultSet;
        } else {
          const passwordMatch = await verifyText(password, user.password);
          if (!passwordMatch) {
            user.num_of_login_attempt += 1;
            resultSet = {
              msg: "invalid username/email or password",
              statusCode: 403,
            };
            if (user.num_of_login_attempt == MAX_LOGIN_ATTEMPTS) {
              user.account_locked = true;
              const block_date = moment().add(24, "hours");
              // console.log(block_date);
              user.login_block_date = block_date;
              resultSet = {
                msg: "Account is temporarily blocked due to multiple incorrect login attempts. Please try again later.",
                statusCode: 403,
              };
            }
            await user.save();

            return resultSet;
          } else {
            user.num_of_login_attempt = 0;
            user.account_locked = false;
            await user.save();
            if (user.gauth_enabled && user.gauth_verified) {
              resultSet = {
                msg: "2FA enabled",
                gauth: true,
                statusCode: 200,
              };
              return resultSet;
            } else {
              const token = jwt.sign(
                {
                  _id: user.id,
                  email: user.email,
                  role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "15d" }
              );
              const expire = jwt.sign(
                {
                  _id: user.id,
                },
                process.env.JWT_SECRET,
                { expiresIn: "15d" }
              );
              resultSet = {
                msg: "Login Successful",
                token: token,
                expire,
                gauth: false,
                statusCode: 200,
              };
              return resultSet;
            }
          }
        }
      } else {
        resultSet = {
          msg: "No user found",
          statusCode: 400,
        };
        return resultSet;
      }
    } catch (error) {
      resultSet = {
        msg: error.message,
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
      // console.log(`user`, user._id);
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
          msg: "Sucess : Reset-Password link sent to Email sent successfully",
          statusCode: 200,
          id: user._id,
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
  const { _id } = request.user;
  try {
    if (request.body.password) {
      const user = await TableUser.findOne({ _id: _id, is_delete: false });
      // console.log(`user`, user);
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
          statusCode: 404,
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
    const { _id } = req.user;
    try {
      const { password, confirm_password } = request.body;

      const user = await TableUser.findOne({
        _id: _id,
        // is_active: true,
      });

      if (user) {
        const hashedPassword = await hashText(password);
        const hashedConfirmPassword = await hashText(confirm_password);

        await TableUser.findByIdAndUpdate(
          {
            _id: _id,
          },
          {
            $set: {
              password: hashedPassword,
              confirm_password: hashedConfirmPassword,
            },
          }
        );

        resultSet = {
          msg: "success",
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
      const { base64, ext, mimeType, fileName, path } = request.body;
      var s3 = new AWS.S3({
        region: process.env.AWS_BUCKET_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
      var options = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: path + fileName,
      };
      await s3.deleteObject(options).promise();
      const buffer = Buffer.from(base64, "base64");
      const detectedExt = ext;
      const detectedMime = mimeType;
      const key = `${fileName}.${detectedExt}`;
      let url = "";
      await s3
        .putObject({
          Body: buffer,
          Key: `${path}/${key}`,
          ContentType: detectedMime,
          Bucket: process.env.AWS_BUCKET_NAME,
          // ACL: "public-read-write",
        })
        .promise();
      url = `https://massa-quest.s3.eu-north-1.amazonaws.com/${path}/${key}`;
      resultSet = {
        msg: "File uploaded successfully",
        data: url,
        statusCode: 200,
      };
      return resultSet;
    } catch (err) {
      // console.log(err);
      resultSet = {
        msg: "Something wrong happened",
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

async function generateOTP(id) {
  if (id != "" && typeof id !== "undefined") {
    try {
      // console.log(`requestGenerateOTP`, id);
      const user = await TableUser.findOne({ _id: id });
      // console.log(`user`, user);
      const currentTime = moment();
      const otpExpirationTime = moment(currentTime).add(30, "minutes");
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      user.otp = otp;
      user.otp_expire_time = otpExpirationTime;
      const resend_time = moment();
      user.otp_resend_time = resend_time;
      await user.save();
      const template = await EmailTemplates.findOne({ name: "signup_otp" });
      if (template) {
        transporter.sendMail(
          {
            from: '"Ryuk Labs 👻" <margarette.schroeder0@ethereal.email>',
            to: user.email,
            subject: template.subject,
            text: template.body_text.replace("{otp}", otp),
            html: template.body_html.replace("{otp}", otp),
          },
          (error, _) => {
            if (error) {
              resultSet = {
                msg: error,
                statusCode: 400,
              };
            }
          }
        );
      } else {
        resultSet = {
          msg: error,
          statusCode: 400,
        };
      }
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
      // console.log(generatedSecret);
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

async function verifyUser(request) {
  try {
    if (!request || typeof request.body !== "object") {
      return {
        msg: "Invalid request",
        statusCode: 400,
      };
    }
    const { otp } = request.body;

    // console.log(request.body);
    if (!otp) {
      return {
        msg: "OTP are required",
        statusCode: 400,
      };
    }
    const user = await TableUser.findOne({ _id: request.params.id, otp });
    if (!user) {
      return {
        msg: "invalid OTP",
        statusCode: 404,
      };
    }
    const current_date = moment();
    const expire_time = moment(user.otp_expire_time);
    if (expire_time.isBefore(current_date)) {
      return {
        msg: "OTP has been expired",
        statusCode: 400,
      };
    }
    await TableUser.findByIdAndUpdate(
      { _id: request.params.id },
      { $set: { otp: "", is_active: true, role: "trader", tier: "free" } }
    );
    return {
      msg: "User successfully verified",
      data: otp,
      statusCode: 200,
    };
  } catch (error) {
    return {
      msg: error.message || "Internal server error",
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
  updateExchange,
  deleteExchange,
};
