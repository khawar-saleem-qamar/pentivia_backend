const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    default: "" 
  },
  email: { 
    type: String, 
    default: "" 
  },
  level: {
    type: String,
    enum: ['Pro', "Level 1", "Level 2", "Beginner"],
    default: "Beginner"
  },
  password: { 
    type: String, 
    default: "" 
  },
  walletid: {
    type: mongoose.Schema.Types.ObjectId
  },
  profilePic: {
    type: String, 
    default: ""
  },
  profileDescription: { 
    type: String, 
    default: "" 
  },
  youtube: {type: String, default: "" },
  instagram: {type: String, default: "" },
  twitter:{type: String, default: "" },
  tiktok:{type: String, default: "" },
  facebook:{type: String, default: "" },
  fcmtoken: [{ type: String, default: [] }],
  testStarted: {type: Number, default: 0},
  testEnded: {type: Number, default: 0},
  bio: { type: String, default: "" },
  typedSeconds: {type: Number, default: 0},

  requestNotifications: {
    type: Boolean,
    default: true
  },
  chatNotifications: {
    type: Boolean,
    default: true
  },
  requestAnnouncements: {
    type: Boolean,
    default: true
  },
  updateNotifications: {
    type: Boolean,
    default: true
  }
  // appleId: { type: String },
  // about: { type: String, default: "" },
  // profilePicture: { type: String, default: "" },
  // followers: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // following: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // posts: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // stories: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // reels: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // blocked: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // twitterUrl: { type: String, default: "" },
  // facebookUrl: { type: String, default: "" },
  // instagramUrl: { type: String, default: "" },
  // linkedinUrl: { type: String, default: "" },
  // WebsiteUrl: { type: String, default: "" },
  // bio: { type: String, default: "" },
  // walletid: { type: mongoose.Schema.Types.ObjectId },
  // is_online: { type: String, default: "0" },
  // savedPosts: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // isVerified: { type: Boolean, default: false },
  // clubid: { type: mongoose.Schema.Types.ObjectId, default: null },
  // clubsJoined: [{ type: mongoose.Schema.Types.ObjectId, default: [] }],
  // fcmtoken: [{ type: String, default: [] }],
  // liveAccess: { type: Boolean, default: true },
  // banned: { type: Boolean, default: false },
  // isLive: { type: Boolean, default: false },
  // pliadAccessToken: {type: String, default: ""},
  // plaidItemId: {type: String, default: ""}
});

module.exports = mongoose.model("User", userSchema);
