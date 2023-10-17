const crypto = require("crypto");
const axios = require("axios");

const CryptoJS = require("crypto-js");

const binanceVerify = async (api_key, api_secret) => {
	const timestamp = Date.now();
	const signature = crypto
		.createHmac("sha256", api_secret)
		.update(`timestamp=${timestamp}`)
		.digest("hex");

	const config = {
		headers: {
			"X-MBX-APIKEY": api_key,
		},
	};

	res = await axios
		.get(`${process.env.BINANCE_API_URL}?timestamp=${timestamp}&signature=${signature}`, config)
		.then((response) => {
			return response.request.res.statusCode;
		})
		.catch((error) => {
			return error.request.res.statusCode;
		});

	return res;
};

const okxVerify = async (api_key, api_secret, passphrase) => {
	const api = "https://www.okex.com";
	const api_endpoint = "/api/v5/account/balance";
	const newDate = Date.now();
	const timestamp = new Date(newDate).toISOString();
	const sign = CryptoJS.enc.Base64.stringify(
		CryptoJS.HmacSHA256(timestamp + "GET" + "/api/v5/account/balance", api_secret)
	);

	const headers = {
		"OK-ACCESS-KEY": api_key,
		"OK-ACCESS-SIGN": sign,
		"OK-ACCESS-TIMESTAMP": timestamp,
		"OK-ACCESS-PASSPHRASE": passphrase,
		"Content-Type": "application/json",
	};

	const res = await axios
		.get(api + api_endpoint, { headers })
		.then((response) => {
			return response.data.code;
		})
		.catch((error) => {
			return error.response.data.code;
		});

	return res;
};

const kuCoinVerify = async (api_key, api_secret, passphrase) => {
	const endpoint = "/api/v1/accounts";
	const timestamp = Date.now();
	const method = "GET";
	const strToSign = timestamp + method + endpoint;
	const signature = crypto.createHmac("sha256", api_secret).update(strToSign).digest("base64");
	const passphraseData = crypto
		.createHmac("sha256", api_secret)
		.update(passphrase)
		.digest("base64");

	const headers = {
		"KC-API-KEY": api_key,
		"KC-API-KEY-VERSION": "2",
		"KC-API-PASSPHRASE": passphraseData,
		"KC-API-SIGN": signature,
		"KC-API-TIMESTAMP": timestamp.toString(),
	};

	const res = await axios
		.get(process.env.KUCOIN_API_BASE_URL + endpoint, { headers })
		.then((response) => {
			return response.data.code;
		})
		.catch((error) => {
			console.log("e", error.response.data);
			return error.response.data.code;
		});

	return res;
};

module.exports = { binanceVerify, okxVerify, kuCoinVerify };
