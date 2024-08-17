const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const UnderSignup = require("../models/underSignupModel");
const {is, sendRes} = require("../helpers/otherHelpers")

const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const qs = require("querystring");



require("dotenv").config();


const godaddyEmail = process.env.EMAIL;
const godaddyPassword = process.env.PASSWORD;

const mailTransport = nodemailer.createTransport({
  // host: "smtp.office365.com",
  // port: 587,
  service: "gmail",
  auth: {
    user: godaddyEmail,
    pass: godaddyPassword
  }
  // secureConnection: true,
  // tls: { ciphers: "SSLv3" },
});

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_String);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      sendRes(res, 400, false, "All Fields must be filled");
      return;
    }
    var user = await User.findOne({ email });

    if (!user) {
      user = await User.findOne({ username: email });
    }

    if (!user) {
      sendRes(res, 400, false, "Incorrect usename or password");
      return;
    }


    if (!user.password) {
      sendRes(res, 400, false, "Please complete your signup first!");
      return;
    }

    const token = createToken(user._id);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      sendRes(res, 400, false, "Incorrect usename or password");
      return;
    }

    const userObject = user.toObject();
    delete userObject.password;

    url = user.profilePic
    sendRes(res, 200, true, { user: userObject, token, url });
  } catch (error) {
    sendRes(res, 400, false, error.message);
  }
};
  
const signupUser = async (req, res) => {
  const { username, firstname, lastname, email, password, averageTyping } = req.body;

  try {
    const existsEmail = await User.findOne({ email });
    const existsUsername = await User.findOne({ username });

    if (existsEmail) {
      sendRes(res, 400, false, "Email already in use");
      return;
    }
    if (existsUsername) {
      sendRes(res, 400, false, "Username unavailable");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const otp = OTP();
    const otpDoc = await UnderSignup.findOne({ email });
    if (otpDoc) {
      await otpDoc.deleteOne();
    }
    await UnderSignup.create({
      email,
      username,
      firstname,
      lastname,
      password: hashed,
      otp,
      averageTyping
    });

    await sendMail(otp, username, email, "SignUp");

    sendRes(res, 200, true, "SignUp Pending. OTP Sent");
  } catch (error) {
    sendRes(res, 400, false, error.message );
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
      const firstname = otpDoc.firstname;
      const lastname = otpDoc.lastname;
      const email = otpDoc.email;
      const password = otpDoc.password;
      const averageTyping = otpDoc.averageTyping;
      const user = await User.create({
        username,
        firstname,
        lastname,
        email,
        password,
        averageTyping
      });
      const wallet = await Wallet.create({ userid: user._id });
      await user.updateOne({
        walletid: wallet._id,
      });
      await otpDoc.deleteOne();
      sendRes(res, 200, true, "Sign Up Successfull");
    } else {
      sendRes(res, 400, false, "Otp Verification Failed");
    }
  } catch (error) {
    sendRes(res, 400, false, error.message );
  }
};

function OTP() {
  const min = 1000; // Minimum 4-digit number
  const max = 9999; // Maximum 4-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otpDoc = await UnderSignup.findOne({ email });

    if (!otpDoc) {
      sendRes(res, 400, false, "Sign Up Again");
    }

    const otp = OTP();

    await otpDoc.updateOne({
      otp,
    });

    // const username = otpDoc.username;

    await sendMail(otp, username, email, "SignUp");

    sendRes(res, 200, true, "OTP Resent");
  } catch (error) {
    sendRes(res, 400, false, error.message );
  }
}

const resetPasswordRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      sendRes(res, 400, false, "Email not found");
    }

    const otp = OTP();

    await UnderSignup.create({ email, otp });

    await sendMail(otp, user.username, email, "password reset");

    sendRes(res, 200, true, "Verification Pending. OTP Sent");
  } catch (error) {
    sendRes(res, 400, false, error.message);
  }
}

const verifyPasswordOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const user = await User.findOne({ email });
    if (!user) {
      sendRes(res, 400, false, "User Not Found");
    }

    const otpDocument = await UnderSignup.findOne({ email, otp });

    if (otpDocument) {
      sendRes(res, 200, true, "Verification Successful");
    } else {
      sendRes(res, 400, false, "Verification Failed");
    }
  } catch (error) {
    sendRes(res, 400, false, error.message );
  }
}

const newPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      sendRes(res, 400, false, "User Not Found");
    }
    const newpassword = req.body.newpassword;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newpassword, salt);
    await user.updateOne({
      password: hashed,
    });
    sendRes(res, 200, true, "Password Reset");
  } catch (error) {
    sendRes(res, 400, false, error.message );
  }
}

const resendPasswordOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otpDoc = await UnderSignup.findOne({ email });

    if (!otpDoc) {
      sendRes(res, 400, false, "Request Change Password Again");
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

    await sendMail(otp, username, email, "password reset");

    sendRes(res, 200, true, "OTP Resent");
  } catch (error) {
    sendRes(res, 400, false, error.message );
  }
}

const setFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      sendRes(res, 400, false, "User Not Found");
    }

    if (!user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $push: { fcmtoken },
      });
    }

    sendRes(res, 200, true, "Token Added");
  } catch (error) {
    sendRes(res, 400, false, error.messages);
  }
};

const deleteFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      sendRes(res, 400, false, "User Not Found");
    }

    if (user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $pull: { fcmtoken },
      });
    }

    sendRes(res, 200, true, "Token Deleted");
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

async function sendMail(otp, username, email, type) {
  try {
    const mailOptions = {
      from: godaddyEmail,
      to: email,
      subject: `Pentivia OTP for ${type}`,
      html: `Dear ${username},
            
Your One-Time Password (OTP) for ${type} is:
<h1>${otp}</h1>
Do not share with anyone.

This OTP will expire in 10 minutes!
          
Team Pentivia`,
    };

    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
}

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
