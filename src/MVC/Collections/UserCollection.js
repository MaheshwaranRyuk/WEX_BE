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
  referrallink: {
    type: String,
    default: "",
  },
  Referral_count :{
    type: Number,
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
  reset_password_token: {
    type: String,
    default: "",
  },
  reset_password_tries:{
    type: Number,
    default: 15
  },
  password_reset_expire_time:{
    type: Date // 30 mins from now
  },
  password_reset_resend:{
    type: Date
  },
  otp: {
    type: String,
    default: "",
  },
  otp_expire_time:{
     type: Date // 30 mins from now
  },
  otp_resend_time:{
     type:Date
  },
  gauth_enabled : {
    type : Boolean,
    default: false,
  },

  gauth_verified : {
    type : Boolean,
    default: false,

  },

  gauth_ascii : {
    type : String,
    default: "",
  },

  gauth_hex : {
    type : String,
    default: "",
  },

  gauth_base32 : {
    type : String,
    default: "",
  },

  gauth_auth_url : {
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
  },
  num_of_login_attempt:{
     type: Number,
     default: 0
  },
  login_block_date:{
     type: Date  // 2 hours from now
  },
  account_locked:{
      type: Boolean,
      default: false
  }

});

module.exports = Article = mongoose.model("Users", UserSchema);
