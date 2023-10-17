const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionSchema = Schema({
	user_id: { type: mongoose.Types.ObjectId, required: true },
	master_trader_id: { type: mongoose.Types.ObjectId, required: true },
	exchange_api_id: { type: mongoose.Types.ObjectId, required: true },
	copy_trading_type: { type: String, enum: ["FIXED_AMOUNT", "CUSTOM_POSITION", "CUSTOM_FIXED"] },
	maximum_tradable_amount: { type: Number },
	percentage_portfolio: { type: Number },
	leverage: { type: Number },
	is_active: { type: Boolean, default: true },
	created_at: { type: Date, default: Date.now() },
	is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("subscription", SubscriptionSchema);
