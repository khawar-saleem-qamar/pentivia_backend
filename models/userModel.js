const mongoose = require("mongoose");

const socialAccountSchema = new mongoose.Schema({
  subscribers: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  contentLink: {
    type: String,
    default: null
  },
  accountName: {
    type: String,
    default: null
  }
})

const getDefaultSocial = () => ({
  subscribers: 0,
  address: "",
  contentLink: "",
  accountName: ""
});


const bankSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  number: { type: String, default: "" },
  type: { type: String, default: "" },
})

const serviceSchema = new mongoose.Schema({
  type:  { type: String, enum: ["online", "offline", ""], default: "" },
  serviceName: { type: String, default: "" },
  url: { type: String, default: "" },
  businessName: { type: String, default: "" },
  storeAddress: { type: String, default: "" },
  sns: {type:Boolean, default: false}
})

const getDefaultService = () => ({
  type: "",
  serviceName: "",
  url: "",
  businessName: "",
  storeAddress: "",
  sns: false
});

const companySchema = new mongoose.Schema({
  name: { type: String, default: "" },
  relation: { type: String, enum: ["executive, employee, agency"], default: "" },
  registration:  { type: String, default: "" },
})

const automaticOptionsSchema = new mongoose.Schema({
  autoSelectInfluencersOnline: {
    type:Boolean, 
    default: false
  },
  autoSelectInfluencersOffline: {
    type:Boolean, 
    default: false
  },
  campaignContentAutoApproveOnline: {
    type:Boolean, 
    default: false
  },
  campaignContentAutoApproveOffline: {
    type:Boolean, 
    default: false
  },
  recommendOnlineGeneral: {
    type:Boolean, 
    default: false

  },
  recommendOfflineGeneral: {
    type:Boolean, 
    default: false

  },
  recommendOnlineImfact: {
    type:Boolean, 
    default: false

  },
  recommendOfflineImfact: {
    type:Boolean, 
    default: false

  },
  inactiveForOnline: {
    type:Boolean, 
    default: false

  },
  inactiveForOffline: {
    type:Boolean, 
    default: false

  },
  periodInactiveForOnline: {
    type: {
      startDate: { type: Date},
      endDate: { type: Date},
    },
    default: {}

  },
  periodInactiveForOffline: {
    type: {
      startDate: { type: Date},
      endDate: { type: Date},
    },
    default: {}

  },
  availableTimeOffline: {
    type: {
      startDate: { type: Date},
      endDate: { type: Date},
    },
    default: {}

  },
  notificationRegisteringCampaign: {
    type:Boolean, 
    default: false

  },
  notificationCampaignStatus: {
    type:Boolean, 
    default: false

  },
})

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    default: "" 
  },
  dob: { 
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
  phone: { 
    type: String, 
    default: "" 
  },
  recentCampaignsSeen: {
    type: String
  },
  walletid: {
    type: mongoose.Schema.Types.ObjectId
  },
  profilePic: {
    type: String, 
    default: ""
  },
  profileTitle: { 
    type: String, 
    default: "" 
  },
  profileDescription: { 
    type: String, 
    default: "" 
  },
  tags: [
    { 
      type: String, 
      default: [] 
    }
  ],
  activityCategories: [
    { 
      type: String, 
      default: [] 
    }
  ],
  address: { 
    type: String, 
    default: "" 
  },
  shoppingMall: { 
    type: String, 
    default: "" 
  },
  youtube: {type: socialAccountSchema, default: getDefaultSocial },
  instagram: {type: socialAccountSchema, default: getDefaultSocial },
  twitter:{type: socialAccountSchema, default: getDefaultSocial },
  tiktok:{type: socialAccountSchema, default: getDefaultSocial },
  naver:{type: socialAccountSchema, default: getDefaultSocial },
  bank: bankSchema,
  business:companySchema,
  service: { type: serviceSchema, default: getDefaultService },
  automaticOptions: {
    type: automaticOptionsSchema,
    default: () => ({})
  },
  signupStatus: [{
    type: String,
    enum: [
      "fresh",
      "basic",
      "social",
      "bank",
      "business"
    ],
    default: function() {
      return ["fresh"];
    }
  }],
  creatorAccount: {
    type: Boolean,
    default: true
  },
  customerAccount: {
    type: Boolean,
    default: false
  },
  currentAccountState: {
    type: String,
    enum: ["creator", "customer"],
    default: "creator"
  },
  campaignsCreated: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  verifiedBusiness: {
    type:  Boolean,
    default: false
  },
  fcmtoken: [{ type: String, default: [] }],
  customerActionRequired: {
    type: [
      {
        for: String,
        modelid: mongoose.Schema.Types.ObjectId,
        action: String
      }
    ],
    default: []
  }, // any action required for customer account
  creatorActionRequired: {
    type: [
      {
        for: String,
        modelid: mongoose.Schema.Types.ObjectId,
        action: String
      }
    ],
    default: []
  }, // any action required for creator account
  campaignsJoined: [{
    type: mongoose.Schema.Types.ObjectId
  }], //the present joined campaign
  reviewScore: {
    type: Number,
    default: 0
  }, // to count the ratio for approve score also
  participatedCampaignsCount: {
    type: Number,
    default: 0
  }, //to count the ratio for approve score
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
