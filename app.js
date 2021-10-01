//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
//Adding session dependencies
const session = require ("express-session");
const passport = require ("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
// Use session here before mongoose connection
app.use(session({
  secret:"Our little secret.",
  resave: false,
  saveUninitialized:false
}));
//use passport and sessoin
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//Hash and salt Passwords
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//Create strategy
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/secrets", (req,res)=>{
  //If the user is authenticated, then it will render the dashboard
  //Else it will redirect to login
  if (req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout" , (req,res)=>{
  //logout and end session
  req.logout();
  res.redirect("/");
})
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  //REGISTER USER USING PASSPORT
  User.register({username:req.body.username}, req.body.password, function(err,user){
    if (err){
      console.log(err);
      res.redirect("/register");
    }else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", (req, res) => {
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
//use login option from passport to check data and start session if
//correct
  req.login(user,function(err){
    if (err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
