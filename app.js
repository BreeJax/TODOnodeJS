const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const jsonfile = require("jsonfile")
const expressSession = require("express-session")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const expressValidator = require("express-validator")
const User = require("./models/userSchema")

//
// models = require("./models"),
// expressValidator = require("express-validator"),

mongoose.connect("mongodb://localhost/todoLogin")
const app = express()

// Define how passport authenticates
passport.use(
  "login",
  //MW
  // uses the local Strategy (e.g. NOT using twitter,facebook, etc)
  new LocalStrategy((username, password, next) => {
    // Ask for an authenticated user based on name and password
    User.authenticate(username, password, (err, user) => {
      // ERORR
      if (err) {
        return next(err)
      }

      // GOT A USER!
      if (user) {
        return next(null, user)
      }

      // NO USER
      return next(null, false, {
        message: "There is no user with that username and password."
      })
    })
  })
)

passport.use(
  "register",
  new LocalStrategy((username, password, next) => {
    let data = {
      username: username,
      password: password
    }
    // create a user
    User.create(data)
      .then(user => {
        // save to database
        return next(null, user)
      })
      .catch(err => next(err))
  })
)

passport.serializeUser(function(user, next) {
  //MW
  next(null, user.id)
})
// thaw the user
passport.deserializeUser(function(id, next) {
  //MW
  User.findById(id, function(err, user) {
    next(err, user)
  })
})
// sessions!
app.use(
  expressSession({
    secret: "LoveForAll",
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize()) //MW
app.use(passport.session()) //MW
// Generates hash using bCrypt

// freeze-dry the user

// Initialize password and use the session
// app.use(flash())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine("mustache", mustacheExpress())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

var createHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

app.get("/login", (req, res) => {
  res.render("login")
})

app.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login/"
  })
)

app.post(
  "/register",
  passport.authenticate("register", {
    successRedirect: "/",
    failureRedirect: "/login/"
  })
)

// Middleware to redirect user unless they are logged in
const requireLogin = function(req, res, next) {
  //MW
  // If a user exists
  if (req.user) {
    // Move on
    next()
  } else {
    // Go back to the login page
    res.redirect("/login/")
  }
}

// Everything below here requires a login
app.use(requireLogin)

//req, res cycle- youre browser sends  a request to "/", and gets back a responce.
app.get("/", (req, res) => {
  const user = req.user
  const todos = req.session.todos || []

  const todoData = {
    todos: todos.filter(todos => !todos.completed),
    fintodos: todos.filter(todos => todos.completed),
    user: user
  }
  res.render("index", todoData)
})

app.post("/logout", (req, res, next) => {
  req.session.destroy(err => {
    res.redirect("login")
  })
})

app.post("/add", (req, res) => {
  const todos = req.session.todos || []
  const description = req.body.description

  todos.push({ id: todos.length + 1, completed: false, description: description })
  req.session.todos = todos
  res.redirect("/")
})

//post= giving info to the server

app.post("/completed", (req, res) => {
  const todos = req.session.todos || []
  const id = parseInt(req.body.id)
  let fintodo = todos.find(todos => todos.id === id)
  if (fintodo) {
    fintodo.completed = true
    fintodo.when = new Date()
    req.session.todos = todos
  }
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
