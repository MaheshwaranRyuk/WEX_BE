const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExchangeSchema = Schema({

    user_id : {
     type : mongoose.Schema.Types.ObjectId,
     required: true,
     default: "",
    },
    exchange : {
        type : String,
        required: true,
        default: "",
    },
    exchange_type : {
        type : String,
        required: true,
        default: "",
    },
    api_Key : {
        type : String,
        required: true,
        default: "",
    },
    Seceret_Key : {
        type : String,
        required: true,
        default: "",
    }

});

module.exports = Article = mongoose.model("exchange", ExchangeSchema);
