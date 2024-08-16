const mongoose = require("mongoose");

const underSignupSchema = new mongoose.Schema({
  username: { type: String, default: "" },
  dob: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  otp: { type: String, default: "" },
});

module.exports = mongoose.model("UnderSingup", underSignupSchema);
