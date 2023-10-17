const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TierSubscriptionHistorySchema = Schema({
	user_id: { type: mongoose.Types.ObjectId },
	date: { type: Date, default: Date.now() },
	tier: { type: String, default: "" },
	amount: { type: Number, default: 0 },
	type: { type: String, default: "" },
});

module.exports = mongoose.model("tiersubscriptionhistories", TierSubscriptionHistorySchema);
