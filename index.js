// #region Imports:packages
require("dotenv").config();
const cors = require("cors")
const express = require("express");
const mongoose = require("mongoose");
const path = require("path")
const crypto = require("crypto");
const http = require("http");
const axios = require("axios")
const fs = require("fs")
// #endregion Imports:packages

// #region Imports:local
// #endregion Imports:local

// #region Models
const User  = require("./models/userModel");


// #endregion Models

// #region Controllers
const {sendNotification}  = require("./controllers/notificationController");


// #endregion Models

// #region App Initializations
const app = express();
app.set("view engine", "ejs");
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage:storage})
const server = http.createServer(app);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(express.static("uploads"));
app.use(cors());
app.use(express.json());

// #endregion App Initializations End

// #region Routes
// const nameRoutes = require("./routes/nameRoutes");
// const userRoutes = require("./routes/userRoutes");
// app.use("/user", userRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);
const typingRoutes = require("./routes/typingRoutes");
app.use("/typing", typingRoutes);

// var {testRadomImge} = require("./controllers/authController")
// testRadomImge();


app.use("/", (req, res) => {
  res.send(`${req.method} Route ${req.path} not found !`);
});


// #endregion Routes
 
// #region MongoDb connection
mongoose
.connect(process.env.DATABASE_URL)
.then(() => {
    server.listen(process.env.PORT, () => {
    console.log("Connected to DB and Server is Running");
    });
})
.catch((error) => {
    console.log(error);
});
// #endregion MongoDb connection




// #region Custom Manipulation
async function custom(req, res){
  var file = req.file
  if(file){
    file = await is.upload(file);
  }

  res.status(200).send(file)
}



// custom()

// #endregion Custom server manipulation


async function manual(){
  var users = await User.find({});
  await Promise.all(
    users.map(async user => {
      await sendNotification(user._id, "test notificatio", "sent by server side", "test", "modelid for test")
    })
  )
}

async function manualLoop(){
  setInterval(async ()=>{
    await manual();
  }, 5000)
}

// manualLoop();