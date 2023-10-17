const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const payments = Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	session_id: {
		type: String,
	},
	type: { type: String, enum: ["STRIPE", "COINGATE"] },
	currency_code: {
		type: String,
		required: true,
	},
	order_id: {
		type: Number,
	},
	amount: {
		type: Number,
		required: true,
		default: "",
	},
	is_success: {
		type: Boolean,
		default: false,
	},
});

module.exports = Payments = mongoose.model("Payments", payments);
