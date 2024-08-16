const User = require("../models/userModel");
// const Wallet = require("../models/walletModel");
require('dotenv').config();
const OtpPass = require("../models/otpPassModel");
const {tryCatch, error, validateUser} = require("../helpers/otherHelpers")


const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const {is} = require("../helpers/otherHelpers")

const crypto = require("crypto");
const bcrypt = require("bcrypt");

require("dotenv").config();

bucketName = process.env.BUCKET_NAME;
bucketRegion = process.env.BUCKET_REGION;
accessKey = process.env.ACCESS_KEY;
secretAccessKey = process.env.SECRET_ACCESS_KEY;

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const godaddyEmail = process.env.EMAIL;
const godaddyPassword = process.env.PASSWORD;


const mailTransport = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
    user: godaddyEmail,
    pass: godaddyPassword,
  },
  secureConnection: true,
  tls: { ciphers: "SSLv3" },
});

const getUserById = async (req, res) => {
  try {
    const userid = req.params.userid;
    let user = await User.findById(userid).select("-password");
    if (!user) {
      throw Error("User Not Found");
    }

    user = user.toObject();
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const getProfilePic = async (req, res) => {
  try {
    const userid = req.params.userid;

    let url = await getPicUrl(userid);

    res.status(200).json({
      url,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const getPicUrl = async (id) => {
  try {
    let user = await User.findById(id);
    if (!user) {
      return("user deleted")
    }
    return user.profilePic;
  } catch (error) {
    throw error.message;
  }
};

const setProfilePic = async (req, res) => {
    try {
        const {userid} = req.body
      let user = await User.findById(userid);
      if (!user) {
        return("user deleted")
      }
  
      let key = "";
      if (req.file) {
        key = await is.upload(req.file);
        await user.updateOne({
            profilePic: key
        })
      }
      res.status(200).json({
        key
      })
    } catch (error) {
      res.status(400).json({
        error: error.message
      })
    }
  };

async function sendMail(otp, username, email) {
  try {
    const mailOptions = {
      from: godaddyEmail,
      to: email,
      subject: "imFact OTP To Reset Password",
      text: `Dear ${username},
            
Your One-Time Password (OTP) to reset your password is ${otp}. Do not share with anyone.
          
Team imFact`,
    };

    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
}

const deleteUser = async (req, res) => {
  try {
    var {userid} = req.body;
    var user = await User.findById(userid);
    if(user){
      await user.deleteOne();
      var models = [Activity, Wallet];
      await Promise.all(
        models.map(async model => {
          var modelDatas = await model.find({
            $or: [
              { userid: userid },
              { otheruserid: userid }
            ]          
          })
          await Promise.all(
            modelDatas.map(async modelData => {
              await modelData.deleteOne();
              console.log("model: ", model, ", Model data: ", modelData);
            })
          )
        })
      )
    }
      res.status(200).json({
        message: "User deleted successfully"
      });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}

const generateShareableProfileLink = async (req, res) => {
  const userId = req.params.userId;
  var user = await User.findById(userId);
  if(user){
    const deepLink = `${process.env.BASE_URL}/OtherProfileView/${userId}`;
    res.send({ deepLink });
  }else{
    res.send("Invalid userid");
  }
}

const deleteUserByUsername = async (req, res) => {
    try {
        var {username} = req.body;
        var user = await User.findOne({username});
        if(user){
            var userid = user._id;
          await user.deleteOne();
          var models = [Activity, Wallet];
          await Promise.all(
            models.map(async model => {
              var modelDatas = await model.find({
                $or: [
                  { userid: userid },
                  { otheruserid: userid }
                ]          
              })
              await Promise.all(
                modelDatas.map(async modelData => {
                  await modelData.deleteOne();
                  console.log("model: ", model, ", Model data: ", modelData);
                })
              )
            })
          )
        }
          res.status(200).json({
            message: "User deleted successfully"
          });
      } catch (err) {
        res.status(400).json({
          error: err.message
        });
      }
}

const changePassword = async (req, res) => {
    try {
      const { userid, newpassword } = req.body;

      const user = await User.findById(userid);

      if (!user) {
        throw Error("User Not Found");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newpassword, salt);

      await user.updateOne({
        password: hashed,
      });

      res.status(200).json({
        message: "Password Changed",
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  const searchUsers = async (req, res) => {
    try {
      const search = req.body.search || "";
      const { pageNo, perPage, userid, friends } = req.body;
      let users;

      if (friends) {
        const user = await User.findById(userid);

        if (!user) {
          throw Error("User Not Found");
        }
        const friends = user.friends;

        users = await User.find({
          _id: { $in: friends },
          username: { $regex: search, $options: "i" },
        })
          .select("-password")
          .skip((pageNo - 1) * perPage)
          .limit(perPage);
      } else {
        users = await User.find({
          username: { $regex: search, $options: "i" },
        })
          .select("-password")
          .skip((pageNo - 1) * perPage)
          .limit(perPage);
      }

      users = await Promise.all(
        users.map(async (user) => {
          user = user.toObject();
          const url = await getPicUrl(user._id);
          user.profilePic = url;
          return user;
        })
      );

      res.status(200).json({
        users,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password");
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      res.status(200).json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  function OTP() {
    const min = 100000; // Minimum 4-digit number
    const max = 999999; // Maximum 4-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const resetPasswordRequest = async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (!user) {
        throw Error("User Not Found");
      }
  
      const otp = OTP();
      const otpDoc = await OtpPass.findOne({ email });
      if (otpDoc) {
        await otpDoc.deleteOne();
      }
      await OtpPass.create({
        email,
        otp,
      });
  
      const username = user.username
  
      await sendMail(otp, username, email);
  
      res.status(200).json({
        message: "Verification Pending. OTP Sent",
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  };
  
  const verifyPasswordOtp = async (req, res) => {
    try {
      const email = req.body.email;
      let otp = req.body.otp;
      otp = parseInt(otp, 10);
      const otpDoc = await OtpPass.findOne({ email });
  
      if (otpDoc.otp == otp) {
        await otpDoc.deleteOne();
        res.status(200).json({
          message: "Verification Successful",
          verified: true
        });
      } else {
        res.status(200).json({
            message: "Verified Failed",
            verified: false
        })
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  const newPassword = async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });
      if (!user) {
        throw Error("User Not Found");
      }
      const newpassword = req.body.newpassword;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newpassword, salt);
      await user.updateOne({
        password: hashed,
      });
      res.status(200).json({
        message: "Password Reset",
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const setUserInfo = async (req, res) => {
    try{
        // basic stage optionals
        var { 
            userid,
            username,
            profileTitle,
            profileDescription,
            tags,
            activityCategories,
            address,
            shoppingMall,
            youtube,
            instagram, 
            twitter,
            tiktok,
            naver,
            service
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};
        if(username){
            const existsUsername = await User.findOne({ username });
    
            if (existsUsername && user.username != username) {
            throw Error("Username already in use");
            }

            updateData["username"] = username
        }

        if(service){
          if(typeof service == "string")
            service = JSON.parse(service);

          if(service.type){
            if(service.type == "offline"){
              if(!service.businessName){
                throw Error("In online service, businessName is required");
              }
              if(!service.storeAddress){
                throw Error("In online service, storeAddress is required");
              }
            }else if(service.type == "online"){
              if(!service.serviceName){
                throw Error("In online service, serviceName is required");
              }
              if(!service.url){
                throw Error("In online service, url is required")
              }
            }else{
              throw Error("Please enter valid service type one of 'offline' or 'online'");
            }
          }else{
            throw Error("Please specify service type")
          }
          
          updateData["service"] = service;
        }

        if(profileTitle){
            updateData['profileTitle'] = profileTitle
        }

        if(profileDescription){
            updateData['profileDescription'] = profileDescription
        }

        if(tags){
            // var prevTags = user.tags;
            // await Promise.all(
            //     tags.map(tag => {
            //         if(!prevTags.includes(tag)){
            //             prevTags.push(tag);
            //         }
            //     })
            // )
            // await Promise.all(
            //     prevTags.map(tag => {
            //         if(!tags.includes(tag)){
            //             prevTags.pull(tag);
            //         }
            //     })
            // )
            updateData['tags'] = tags
        }

        if(activityCategories){
            // var prevactivityCategories = user.activityCategories;
            // await Promise.all(
            //     activityCategories.map(activityCategorie => {
            //         if(!prevactivityCategories.includes(activityCategorie)){
            //             prevactivityCategories.push(activityCategorie);
            //         }
            //     })
            // )
            updateData['activityCategories'] = activityCategories
        }

        if(address){
            updateData['address'] = address
        }

        if(shoppingMall){
            updateData['shoppingMall'] = shoppingMall
        }

        var social = false;
        if(youtube && youtube != ""){
            social = true;
            var youtubeData = user.youtube
            updateData['youtube'] = youtubeData
            if(!updateData['youtube']){
                updateData['youtube'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!youtube.subscribers && !youtubeData.subscribers){
                throw Error("Please provide youtube subscribers")
            }
            console.log("updatedata: ", updateData);
            console.log("yotube data: ", youtube);
            updateData.youtube.subscribers = youtube.subscribers
            if(!youtube.address && !youtubeData.address){
                throw Error("Please provide youtube account address")
            }
            updateData.youtube.address = youtube.address
            if(!youtube.contentLink && !youtubeData.contentLink){
                throw Error("Please provide youtube representative content link")
            }
            updateData.youtube.contentLink = youtube.contentLink
            
            
            if(!youtube.accountName && !youtubeData.accountName){
              throw Error("Please provide youtube Acount Name ")
            }
            updateData.youtube.accountName = youtube.accountName
            
        }
        if(instagram && instagram != ""){
          social = true;
            var instagramData = user.instagram
            updateData['instagram'] = instagramData
            if(!updateData['instagram']){
                updateData['instagram'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!instagram.subscribers && !instagramData.subscribers){
                throw Error("Please provide instagram subscribers")
            }
            updateData.instagram.subscribers = instagram.subscribers
            if(!instagram.address && !instagramData.address){
                throw Error("Please provide instagram account address")
            }
            updateData.instagram.address = instagram.address
            if(!instagram.contentLink && !instagramData.contentLink){
                throw Error("Please provide instagram representative content link")
            }
            updateData.instagram.contentLink = instagram.contentLink
            
            if(!instagram.accountName && !instagramData.accountName){
              throw Error("Please provide instagram Acount Name ")
            }
            updateData.instagram.accountName = instagram.accountName
        } 
        if(twitter && twitter != ""){
          social = true;
            var twitterData = user.twitter
            updateData['twitter'] = twitterData
            if(!updateData['twitter']){
                updateData['twitter'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!twitter.subscribers && !twitterData.subscribers){
                throw Error("Please provide twitter subscribers")
            }
            updateData.twitter.subscribers = twitter.subscribers
            if(!twitter.address && !twitterData.address){
                throw Error("Please provide twitter account address")
            }
            updateData.twitter.address = twitter.address
            if(!twitter.contentLink && !twitterData.contentLink){
                throw Error("Please provide twitter representative content link")
            }
            updateData.twitter.contentLink = twitter.contentLink

            
            if(!twitter.accountName && !twitterData.accountName){
              throw Error("Please provide twitter Acount Name ")
            }
            updateData.twitter.accountName = twitter.accountName
        }
        if(tiktok && tiktok != ""){
          social = true;
            var tiktokData = user.tiktok
            updateData['tiktok'] = tiktokData
            if(!updateData['tiktok']){
                updateData['tiktok'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!tiktok.subscribers && !tiktokData.subscribers){
                throw Error("Please provide tiktok subscribers")
            }
            updateData.tiktok.subscribers = tiktok.subscribers
            if(!tiktok.address && !tiktokData.address){
                throw Error("Please provide tiktok account address")
            }
            updateData.tiktok.address = tiktok.address
            if(!tiktok.contentLink && !tiktokData.contentLink){
                throw Error("Please provide tiktok representative content link")
            }
            updateData.tiktok.contentLink = tiktok.contentLink

            if(!tiktok.accountName && !tiktokData.accountName){
              throw Error("Please provide tiktok Acount Name ")
            }
            updateData.tiktok.accountName = tiktok.accountName
        }
        if(naver && naver != ""){
          social = true;
            var naverData = user.naver
            updateData['naver'] = naverData
            if(!updateData['naver']){
                updateData['naver'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!naver.subscribers && !naverData.subscribers){
                throw Error("Please provide naver subscribers")
            }
            updateData.naver.subscribers = naver.subscribers
            if(!naver.address && !naverData.address){
                throw Error("Please provide naver account address")
            }
            updateData.naver.address = naver.address
            if(!naver.contentLink && !naverData.contentLink){
                throw Error("Please provide naver representative content link")
            }
            updateData.naver.contentLink = naver.contentLink

            if(!naver.accountName && !naverData.accountName){
              throw Error("Please provide naver Acount Name ")
            }
            updateData.naver.accountName = naver.accountName
        }

        updateData['signupStatus'] = user.signupStatus;
        if(!user.signupStatus.includes("basic")){
          updateData['signupStatus'].push("basic")
        }
        if(!user.signupStatus.includes("social") && social){
          updateData['signupStatus'].push("social")
        }
        await user.updateOne(updateData);
        res.status(200).json({
            message: "User Info Updated"
        })
        // basic stage optionals end
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  const setUserBank = async (req, res) => {
    try{
        // basic stage optionals
        var { 
            userid,
            name,
            number,
            type
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};
        if(name){
            updateData["name"] = name
        }

        if(number){
            updateData['number'] = number
        }

        if(type){
            updateData['type'] = type
        }

        await user.updateOne({
          bank: updateData
        });
        updateData = {};
        if(!user.signupStatus.includes("bank")){
          updateData['signupStatus'] = user.signupStatus;
          updateData['signupStatus'].push("bank")
        }
        await user.updateOne(updateData);
        res.status(200).json({
            message: "User Bank Updated"
        })
        // basic stage optionals end
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  const setUserBusiness = async (req, res) => {
    try{
        // basic stage optionals
        var { 
            userid,
            name,
            relation,
            registration
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};
        if(name){
            updateData["name"] = name
        }

        if(relation){
            var availableRelations = ["executive", "employee", "agency"];
            if(availableRelations.includes(relation)){
              updateData['relation'] = relation
            }else{
              throw Error("Please enter one following relation with the company: executive, employee, agency");
            }
        }

        if(registration){
            updateData['registration'] = registration
        }

        // check business validation here

        var isverifiedBusiness = true
        if(isverifiedBusiness){
          updateData["verifiedBusiness"] = true;
          await user.updateOne({
            business: updateData
          });
          updateData = {};
          if(!user.signupStatus.includes("business")){
            updateData['signupStatus'] = user.signupStatus;
            updateData['signupStatus'].push("business")
          }
          await user.updateOne(updateData);
        }else{
          throw Error("Please enter valid business information! Business not verified.")
        }

        res.status(200).json({
            message: "User Business Updated"
        })
        // basic stage optionals end
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  const setAutomaticOptions = async (req, res) => {
    try{
        // basic stage optionals
        var { 
            userid,
            autoSelectInfluencersOnline ,
            autoSelectInfluencersOffline ,
            campaignContentAutoApproveOnline ,
            campaignContentAutoApproveOffline ,
            recommendOnlineGeneral ,
            recommendOfflineGeneral ,
            recommendOnlineImfact ,
            recommendOfflineImfact ,
            inactiveForOnline ,
            inactiveForOffline ,
            periodInactiveForOnline ,
            periodInactiveForOffline ,
            availableTimeOffline ,
            notificationRegisteringCampaign ,
            notificationCampaignStatus,
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};
        updateData = user.automaticOptions;
        if(autoSelectInfluencersOnline){
            updateData["autoSelectInfluencersOnline"] = autoSelectInfluencersOnline
        }

        if(autoSelectInfluencersOffline){
          updateData["autoSelectInfluencersOffline"] = autoSelectInfluencersOffline
        }
        if(campaignContentAutoApproveOnline){
          updateData["campaignContentAutoApproveOnline"] = campaignContentAutoApproveOnline
        }
        if(campaignContentAutoApproveOffline){
          updateData["campaignContentAutoApproveOffline"] = campaignContentAutoApproveOffline
        }
        if(recommendOnlineGeneral){
          updateData["recommendOnlineGeneral"] = recommendOnlineGeneral
        }
        if(recommendOfflineGeneral){
          updateData["recommendOfflineGeneral"] = recommendOfflineGeneral
        }
        if(recommendOnlineImfact){
          updateData["recommendOnlineImfact"] = recommendOnlineImfact
        }
        if(recommendOfflineImfact){
          updateData["recommendOfflineImfact"] = recommendOfflineImfact
        }
        if(inactiveForOnline){
          updateData["inactiveForOnline"] = inactiveForOnline
        }
        if(inactiveForOffline){
          updateData["inactiveForOffline"] = inactiveForOffline
        }
        if(periodInactiveForOnline){
          updateData["periodInactiveForOnline"] = periodInactiveForOnline
        }
        if(periodInactiveForOffline){
          updateData["periodInactiveForOffline"] = periodInactiveForOffline
        }
        if(availableTimeOffline){
          updateData["availableTimeOffline"] = availableTimeOffline
        }
        if(notificationRegisteringCampaign){
          updateData["notificationRegisteringCampaign"] = notificationRegisteringCampaign
        }
        if(notificationCampaignStatus){
          updateData["notificationCampaignStatus"] = notificationCampaignStatus
        }
        
        await user.updateOne({
          automaticOptions: updateData
        });
        res.status(200).json({
            message: "User automatic options Updated"
        })
        // basic stage optionals end
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  const createCustomer = async (req, res) => {
    try{
        // basic stage optionals
        var {
            userid,
            username,
            profileTitle,
            profileDescription,
            tags,
            activityCategories,
            shoppingMall,
            service
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};

        function isNot(data){
          if(data == null || data == ""){
            return true;
          }
          return false;
        }

        if(username){
            const existsUsername = await User.findOne({ username });
    
            if (existsUsername) {
            throw Error("Username already in use");
            }

            updateData["username"] = username
        }else if(isNot(user.username)){
          throw Error("Please set your username to create customer account")
        }

        if(req.file){
          let key = "";
          key = await is.upload(req.file);
          await user.updateOne({
              profilePic: key
          })

          updateData["profilePic"] = key
        }else if(isNot(user.profilePic)){
          throw Error("Please set your profilePic to create customer account")
        }

        if(profileTitle){
            updateData['profileTitle'] = profileTitle
        }else if(isNot(user.profileTitle)){
          throw Error("Please set your profile title to create customer account")
        }

        if(profileDescription){
            updateData['profileDescription'] = profileDescription
        }else if(isNot(user.profileDescription)){
          throw Error("Please set your profile description to create customer account")
        }

        if(tags){
            updateData['tags'] = tags
        }else if(user.tags.length == 0){
          throw Error("Please set your search tags to create customer account")
        }

        if(activityCategories){
            updateData['activityCategories'] = activityCategories
        }else if(user.activityCategories.length == 0){
          throw Error("Please set your activity categories to create customer account")
        }

        if(shoppingMall){
          updateData['shoppingMall'] = shoppingMall
      }

        if(!service && !user.service && user.service.type == "" ){
          throw Error("Please add service info");
        } else{
          if(typeof service == "string")
            service = JSON.parse(service);
          if(service.type){
            if(service.type == "offline"){
              if(!service.businessName){
                throw Error("In online service, businessName is required");
              }
              if(!service.storeAddress){
                throw Error("In online service, storeAddress is required");
              }
            }else if(service.type == "online"){
              if(!service.serviceName){
                throw Error("In online service, serviceName is required");
              }
              if(!service.url){
                throw Error("In online service, url is required")
              }
            }else{
              throw Error("Please enter valid service type one of 'offline' or 'online'");
            }
          }else{
            throw Error("Please specify service type")
          }
          updateData["service"] = service;
        }
        
        updateData["customerAccount"] = true;
        
        
        await user.updateOne(updateData);
        res.status(200).json({
            message: "Your customer account has been created"
        })
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  const getUserProfile = async (req, res) => {
    const {userid} = req.params;
    var user = await User.findById(userid);
    if(!user){
      throw Error("User not Found");
    }

    var updatedUser = user.toObject();
    updatedUser.dob = new Date(updatedUser.dob);
    delete updatedUser.password
    delete updatedUser.walletid
    delete updatedUser.fcmtoken

    res.status(200).json(updatedUser);
  }

  const switchRole = async(req, res)=>{
    tryCatch(async ()=>{
      const {to,  userid} = req.body;
      var availableRoles = ["customer", "creator"];
      if(!availableRoles.includes(to)){
        error(res, "Invalid role to switch!")
      }

      const user = await validateUser(userid);
      if(to == "customer" && !user.customerAccount){
        res.status(401).json({
          success: false,
          message: "Please create customer account first"
        })
        throw Error("Please create customer account first")
      }
      await user.updateOne({
        currentAccountState: to
      })

      res.status(200).json({
        success: true,
        message: `Role switched to ${to}`
      })
    }, res)
  }

module.exports = {
    getProfilePic,
    setProfilePic,
    getUserById,
    deleteUser,
    deleteUserByUsername,
    generateShareableProfileLink,
    resetPasswordRequest,
    verifyPasswordOtp,
    newPassword,
    searchUsers,
    changePassword,
    getAllUsers,
    setUserInfo,
    setUserBank,
    setUserBusiness,
    setAutomaticOptions,
    createCustomer,
    getUserProfile,
    switchRole
};