const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TierSchema = Schema({
	name: { type: String, enum: ["BASIC", "ADVANCED", "PRO", "PREMIUM"] },
	description: { type: String },
	features: [{ type: String }],
	maximum_api_exchange: { type: Number, default: 0 },
	overall_trade_limit: { type: Number, default: 0 },
	maximum_open_position: { type: Number, default: 0 },
	trade_type: [{ type: String }],
	percentage_portfolio: { type: Number, default: 0 },
	price: { type: Number, default: 0 },
	created_at: { type: Date, default: Date.now() },
	updated_at: { type: Date, default: Date.now() },
	is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("tiers", TierSchema);
