const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const UnderSignup = require("../models/underSignupModel");
const {is} = require("../helpers/otherHelpers")

const Otp = require("../models/otpModel");
const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("querystring");



require("dotenv").config();

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

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_String);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw Error("All Fields must be filled");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw Error("User Not Found");
    }

    if (!user.password) {
      throw Error("Please complete your signup");
    }

    const token = createToken(user._id);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error("Incorrect Password");
    }

    const userObject = user.toObject();
    delete userObject.password;

    url = user.profilePic
    res.status(200).json({ user: userObject, token, url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
const signupUser = async (req, res) => {
  const { username, phone, dob, email, password, signupid } = req.body;

  try {
    if(email && email.trim() != "" && !password){
      var underSignup = await UnderSignup.findById(signupid);
      if(!underSignup){
        throw Error("Invalid signup")
      }
      const existsEmail = await User.findOne({ email });
  
      if (existsEmail) {
        throw Error("Email already in use");
      }

      const otp = OTP();
      const otpDoc = await UnderSignup.findOne({ email });
      if (otpDoc) {
        await otpDoc.deleteOne();
      }

      // await sendMail(otp, underSignup.username, email);

      await underSignup.updateOne({
        email,
        otp
      })

      res.status(200).json({
        message: "SignUp Pending. OTP Sent",
      });
    }else if(email && email.trim() != "" && password && password.trim() != ""){
      var user = await User.findOne({email});
      if(!user){
        throw Error("Invalid email")
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      await user.updateOne({
        password: hashed
      })

      res.status(200).json({
        message: "SignUp successful",
      });
    }else{
      if(username && phone && dob){

        const existsUsername = await User.findOne({ username });
  
        if (existsUsername) {
          throw Error("Username already in use");
        }

        const existsPhone = await User.findOne({ phone });
  
        if (existsPhone) {
          throw Error("Phone already in use");
        }
        var underSignup = await UnderSignup.create({
          username, 
          phone, 
          dob: dob
        })

        res.status(200).json({
          signupid: underSignup._id,
        });
      }else{
        res.staus(400).json({
          error: "Please provide username, phone & dob"
        })
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email;
    let otp = req.body.otp;
    otp = parseInt(otp, 10);
    const otpDoc = await UnderSignup.findOne({ email });

    if (otpDoc.otp == otp) {
      const username = otpDoc.username;
      const phone = otpDoc.phone;
      const dob = otpDoc.dob;
      const email = otpDoc.email;
      const password = otpDoc.password;
      const user = await User.create({
        username,
        dob,
        phone,
        email,
        password,
      });
      const wallet = await Wallet.create({ userid: user._id });
      await user.updateOne({
        walletid: wallet._id,
      });
      if(!user.signupStatus.includes("fresh")){
        await user.updateOne({
          $push: {
            signupStatus: "fresh"
          }
        });
      }
      await otpDoc.deleteOne();
      res.status(200).json({
        message: "Sign Up Successfull",
      });
    } else {
      throw Error("Otp Verification Failed");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

function OTP() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otpDoc = await UnderSignup.findOne({ email });

    if (!otpDoc) {
      throw Error("Sign Up Again");
    }

    const otp = OTP();

    await otpDoc.updateOne({
      otp,
    });

    // const username = otpDoc.username;

    // await sendMail(otp, username, email);

    res.status(200).json({
      message: "OTP Resent",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      throw Error("User Not Found");
    }

    const otp = OTP();

    await UnderSignup.create({ email, otp });

    // await sendMail(otp, user.username, email);

    res.status(200).json({
      message: "Verification Pending. OTP Sent",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

const verifyPasswordOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const user = await User.findOne({ email });
    if (!user) {
      throw Error("User Not Found");
    }

    const otpDocument = await UnderSignup.findOne({ email, otp });

    if (otpDocument) {
      res.status(200).json({
        success: true,
        message: "Verification Successful",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Verification Failed",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

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
}

const resendPasswordOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otpDoc = await UnderSignup.findOne({ email });

    if (!otpDoc) {
      throw Error("Request Change Password Again");
    }

    const otp = OTP();

    await otpDoc.updateOne({
      otp,
    });

    const user = await User.findOne({ email });
    // let username;

    // if (user) {
    //   username = user.username;
    // }

    // await sendMail(otp, username, email);

    res.status(200).json({
      message: "OTP Resent",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const setFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      throw Error("User Not Found");
    }

    if (!user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $push: { fcmtoken },
      });
    }

    res.status(200).json({
      message: "Token Added",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const deleteFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      throw Error("User Not Found");
    }

    if (user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $pull: { fcmtoken },
      });
    }

    res.status(200).json({
      message: "Token Deleted",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// async function sendMail(otp, username, email) {
//   try {
//     const mailOptions = {
//       from: godaddyEmail,
//       to: email,
//       subject: "imFact OTP for SignUp",
//       text: `Dear ${username},
            
// Your One-Time Password (OTP) for SignUp is ${otp}. Do not share with anyone.
          
// Team inFact`,
//     };

//     await mailTransport.sendMail(mailOptions);
//   } catch (err) {
//     console.error(err);
//   }
// }

module.exports = {
  signupUser,
  setFcmToken,
  deleteFcmToken,
  loginUser,
  verifyOTP,
  resendOTP,
  resetPasswordRequest,
  verifyPasswordOtp,
  newPassword,
  resendPasswordOTP
};
