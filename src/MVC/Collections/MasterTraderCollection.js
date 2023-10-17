const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//copy traders details - name , volume array -> need to confirm we need to add this fields or not

const MasterTraderSchema = Schema({
	user_id: { type: mongoose.Types.ObjectId },
	api_key: { type: mongoose.Types.ObjectId },
	// is_approved: { type: Boolean, default: false },
	email: { type: String, default: "" },
	exchange: { type: String, enum: ["BINANCE", "KUCOIN", "OKX"] },
	trade_type: { type: String },
	created_at: { type: Date, default: Date.now() },
	nickname: { type: String, default: "" },
	badge: { type: String, default: "" },
	bio: { type: String, default: "" },
	trade_style: { type: String, default: "" },
	total_num_subscribers: { type: Number, default: 0 },
	overall_trade_volume: { type: Number, default: 0 },
	cumulated_pnl: { type: Number, default: 0 },
	num_open_positions: { type: Number, default: 0 },
	last_trade_time: { type: Date },
	activeness_in_trading: { type: Number, default: 0 },
	average_percentage_wins: { type: Number, default: 0 },
	average_time_per_trade: { type: Number, default: 0 },
	overall_win_rate: { type: Number, default: 0 },
	profit_loss_ratio: { type: Number, default: 0 },
	num_trades: { type: Number, default: 0 },
	num_wins: { type: Number, default: 0 },
	num_losses: { type: Number, default: 0 },
	lead_trader_margin: { type: Number, default: 0 },
	avg_holding_period_per_trade: { type: Number, default: 0 },
	total_pnl: { type: Number, default: 0 },
	total_roi: { type: Number, default: 0 },
	risk_factor: { type: Number, default: 0 },
	visibility: { type: String, enum: ["PUBLIC", "PRIVATE"] },
	status: { type: String, enum: ["APPROVED", "REJECTED", "PENDING"], default: "PENDING" },
	rejection_reason: { type: String, default: "" },
	overall_balance: { type: Number, default: 0 },
	overall_trade_value: { type: Number, default: 0 },
});

module.exports = mongoose.model("mastertrader", MasterTraderSchema);
