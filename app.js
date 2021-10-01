//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
//require hash method using bcrypt
const bcrypt = require("bcrypt");
//Add salt rounds to make the breach even more difficult
const saltRounds = 12;
const port = 3000;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  //Begin salting
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      //REGISTER USER USING MONGODB
      const newUser = new User({
        email: req.body.username,
        //register hashed password after the salt rounds
        password: hash
      });

      newUser.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.render("secrets");
        }
      });
    });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  //Hashed pw check
  const password = req.body.password;
  //CHECK IF USER LOGIN MATCHES THE SAME LOGIN ON THE DB
  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Load hash from your password DB.
        bcrypt.compare(password, hash, function(err, result) {
          //If password matches with the database, then it renders
          //the dashboard
          if (result === true){
          res.render("secrets");
        }
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
