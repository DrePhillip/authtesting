//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose= require("mongoose");
//require hash method
const md5 = require("md5");
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema= new mongoose.Schema({
  email:String,
  password:String
});



const User= new mongoose.model("User",userSchema);

app.get("/",(req,res)=>{
  res.render("home");
});
app.get("/login",(req,res)=>{
  res.render("login");
});
app.get("/register",(req,res)=>{
  res.render("register");
});
app.post("/register",(req,res)=>{
  //REGISTER USER USING MONGODB
  const newUser = new User({
    email: req.body.username,
    //register hashed password
    password:md5(req.body.password)
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render("secrets");
    }
  });
});

app.post("/login",(req,res)=>{
  const username = req.body.username;
  //Hashed pw check
  const password = md5(req.body.password);
//CHECK IF USER LOGIN MATCHES THE SAME LOGIN ON THE DB
  User.findOne({email:username},function(err,foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
