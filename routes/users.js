const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");

router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  //Validation
  let errors = [];

  //Checks if all fields are filled
  if (!name || !email || !password || !password2) {
    errors.push({
      msg: "You have to fill in all fields",
    });
  }

  //Checks if passwords mateches
  if (password !== password2) {
    errors.push({
      msg: "Password are not the same",
    });
  }

  //Checks if password is not too short
  if (password.length < 5) {
    errors.push({
      msg: "Your password is too short",
    });
  }

  //If validation fails it pushes to EJS previously entered data to not to write that shit again
  if (errors.length > 0) {
    console.log("Error");
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    //Checks if email adress already exists
    User.findOne({
      email: email,
    }).then((user) => {
      //if so it gives specific output and do same things like in case of failed validation
      if (user) {
        errors.push({
          msg: "This email is already registered",
        });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        //if email adress wasn't registered before new user var is created
        const newUser = new User({
          name,
          email,
          password,
        });

        //here we have to encrypt the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "You can log in now");
                res.redirect("/users/login");
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      }
    });
  }
});

//Login handler
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//Logout handler
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out now");
  res.redirect("/users/login");
});

module.exports = router;
