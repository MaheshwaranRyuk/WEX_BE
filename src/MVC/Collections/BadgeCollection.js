const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BadgeSchema = Schema({
	profile_pic: { type: String, default: "" },
	name: { type: String, default: "" },
	info: { type: String, default: "" },
	roi_range: { type: Number, default: 0 },
	is_delete: { type: Boolean, default: false },
});

module.exports = mongoose.model("badge", BadgeSchema);
