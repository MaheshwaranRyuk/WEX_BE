const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
	const { authorization } = req.headers;
	if (authorization) {
		const token =
			authorization.split(" ")[0] != "Bearer"
				? authorization.split(" ")[0]
				: authorization.split(" ")[1];
		try {
			console.log("token", token);
			const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
			req.user = decodeToken;
			next();
		} catch (e) {
			console.log("e", e);
			res.status(401).json({
				statusCode: 401,
				message: "invalid token",
			});
		}
	} else {
		res.status(401).json({
			statusCode: 401,
			message: "invalid token",
		});
	}
};

module.exports = {
	authorize,
};
