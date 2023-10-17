const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmailSchema = Schema({
	name: {
		type: String,
		required: true,
	},
	subject: {
		type: String,
		required: true,
	},
	body_text: {
		type: String,
		required: true,
	},
	body_html: {
		type: String,
		required: true,
	},
});

module.exports = EmailTemplate = mongoose.model("EmailTemplate", EmailSchema);
