const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MasterTraderHistorySchema = Schema({
	master_id: { type: mongoose.Types.ObjectId, required: true },
	trade_id: { type: String, default: "" },
	exchange_type: { type: String, enum: ["BINANCE", "KUCOIN", "OKX"] },
	trade_type: [{ type: String }],
	amount: { type: Number, default: 0 },
	side: { type: String, enum: ["buy", "sell", "cancel"] },
	symbol: { type: String },
	date_trade: { type: Date },
	quantity: { type: Number, default: 0 },
	entry_price: { type: Number, default: 0 },
	closing_price: { type: Number, default: 0 },
	market_price: { type: Number, default: 0 },
	closing_time: { type: Date },
	pnl: { type: Number, default: 0 },
	direction: { type: Number, default: 0 },
});

module.exports = mongoose.model("mastertraderhistory", MasterTraderHistorySchema);
