const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepositHistorySchema = Schema({
	user_id: { type: mongoose.Types.ObjectId, required: true },
	payment_id: { type: mongoose.Types.ObjectId, required: true },
	amount: { type: Number, default: 0 },
	status: { type: String, enum: ["APPROVED", "PENDING", "REJECTED"], default: "PENDING" },
	deposit_type: { type: String, enum: ["WALLET_COINGATE", "FIAT_STRIPE"] },
	date: { type: Date, default: Date.now() },
	transaction_url: { type: String },
});

module.exports = mongoose.model("depositehistory", DepositHistorySchema);
