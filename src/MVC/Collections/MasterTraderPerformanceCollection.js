
//need to filter or aggregate by monthly weekly, yearly

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MasterTraderPerformanceSchema = Schema({
	master_trader_id: { type: mongoose.Types.ObjectId },
	exchange_type: { type: String, enum: ["BINANCE", "KUCOIN", "OKX"] },
	total_buy: { type: Number, default: 0 },
	total_sell: { type: Number, default: 0 },
	pnl: { type: Number, default: 0 }, //30day, overall
	roi: { type: Number, default: 0 }, //30day
	aum: { type: Number, default: 0 },
	overall_balance: { type: Number, default: 0 },
	trade_type: [{ type: String }],
	overall_trade_volume: { type: Number, default: 0 },
	win_rate: { type: Number, default: 0 }, //7d, 30d , 90d , overall
	profit_loss_ratio: { type: Number, default: 0 },
	num_trades: { type: Number, default: 0 },
	num_wins: { type: Number, default: 0 },
	num_losses: { type: Number, default: 0 },
	avg_holding_period_per_trade: { type: Number, default: 0 },
	risk_factor: { type: Number, default: 0 },
	volume: { type: Number, default: 0 },
	last_trade_time: { type: Date },
	trade_pairs: [{ type: String }],
});

module.exports = mongoose.model("mastertraderperformace", MasterTraderPerformanceSchema);
