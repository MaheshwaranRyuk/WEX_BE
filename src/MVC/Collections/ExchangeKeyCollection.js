const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExchangeKeySchema = Schema({
	name: { type: String, required: true, default: "" },
	user_id: { type: mongoose.Types.ObjectId, required: true },
	exchange: { type: String, enum: ["BINANCE", "KUCOIN", "OKX"] },
	trade_type: { type: String,enum: ["spot", "coin-m", "usdt-m"] },
	passphrase: { type: String, default: "" },
	api_key: { type: String, required: true },
	api_secret: { type: String, required: true },
	is_valid: { type: Boolean, default: true },
	is_enabled: { type: Boolean, default: true },
	created_at: { type: Date, default: Date.now() },
	updated_at: { type: Date, default: Date.now() },
	is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("exchangekey", ExchangeKeySchema);
