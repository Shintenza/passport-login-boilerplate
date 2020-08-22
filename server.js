const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const app = express();

require("./config/passport")(passport);

//MongoDB configuation etc.
const db = require("./config/keys").MongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });

//EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

//ExpressSession
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Passport

app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global vars (used in layouts)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//BodyParser (it allows u to get informations from form's inputs)
app.use(
  express.urlencoded({
    extended: false,
  })
);

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

app.listen(3000, () => {
  console.log("Server is running");
});
