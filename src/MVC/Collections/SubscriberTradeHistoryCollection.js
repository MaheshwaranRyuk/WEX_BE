const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriberTradeHistorySchema = Schema({
	master_id: { type: mongoose.Types.ObjectId },
	user_id: { type: mongoose.Types.ObjectId },
	master_trader_order_id: { type: mongoose.Types.ObjectId },
	order_id: { type: mongoose.Types.ObjectId },
	exchange_type: { type: String, enum: ["BINANCE", "KUCOIN", "OKX"] },
	trade_type: [{ type: String }],
	amount: { type: Number, default: 0 },
	side: { type: String, enum: ["BUY", "SELL"] },
	tags: [{ type: String }],
});

module.exports = mongoose.model("subscribertradehistory", SubscriberTradeHistorySchema);
