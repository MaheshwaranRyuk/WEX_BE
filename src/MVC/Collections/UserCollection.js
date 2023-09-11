const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({

  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  confirm_password: {
    type: String,
    require: true,
  },
  referralCode: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
  tier: {
    type: String,
    default: "",
  },
  creditPoints: {
    type: Number,
    default: 0,
  },
  userProfilePicture: {
    type: String,
  },
  is_delete: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    default: "",
  },
  
  otp: {
    type: String,
    default: "",
  },

  otp_enabled : {
    type : Boolean,
    default: false,
  },

  otp_verified : {
    type : Boolean,
    default: false,

  },

  otp_ascii : {
    type : String,
    default: "",
  },

  otp_hex : {
    type : String,
    default: "",
  },

  otp_base32 : {
    type : String,
    default: "",
  },

  otp_auth_url : {
    type : String,
    default: "",
  },

  nickname : {
    type : String,
    default: "",
  },

  intro : {
    type : String,
    default: "",
  },

  referralCode : {
    type : String,
    default: "",
  }

});

module.exports = Article = mongoose.model("Users", UserSchema);
