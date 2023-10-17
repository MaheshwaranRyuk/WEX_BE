const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = Schema({
	overall_users: { type: Number, default: 0 },
	overall_master_traders: { type: Number, default: 0 },
	overall_volume_kucoin: { type: Number, default: 0 },
	overall_volume_okx: { type: Number, default: 0 },
	overall_number_binance: { type: Number, default: 0 },
	overall_volume: { type: Number, default: 0 },
	server_status: [{ type: String }],
});

module.exports = mongoose.model("admin", AdminSchema);
