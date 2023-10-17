const jwt = require('jsonwebtoken');
const authorizer = async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      if (authorization) {
        const token =
          authorization.split(" ")[0] != "Bearer"
            ? authorization.split(" ")[0]
            : authorization.split(" ")[1];
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
        let data = null;
        if (decodeToken) {
          data = await TableUserDetails.findOne({
            is_delete: false,
            walletId: decodeToken?.walletId,
          });
        }
        if (data) {
          req.headers.user = { decodeToken, authorization, user: data };
          return true;
        } else {
          data = await TableAdmin.findOne({
            is_delete: false,
            walletId: decodeToken?.walletId,
          });
          if (data) {
            req.headers.user = { decodeToken, authorization, user: data };
            return true;
          } else {
            return false;
          }
        }
      } else {
        res
          .header({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          })
          .status(401)
          .send({
            statusCode: 401,
            data: null,
            message: "Token is in-valid",
            err: {
              message: "Token is required",
            },
          });
        return;
      }
    } catch (error) {
      return false;
    }
  };