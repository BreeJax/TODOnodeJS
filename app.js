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

const app = express()

mongoose.connect("mongodb://localhost/todoLogin")

// Define how passport authenticates
passport.use(
  "login",
  //MW
  // uses the local Strategy (e.g. NOT using twitter,facebook, etc)
  new LocalStrategy(function(username, password, next) {
    // Ask for an authenticated user based on name and password
    User.authenticate(username, password, function(err, user) {
      // ERORR
      if (err) {
        return next(err)
      }

      // GOT A USER!
      if (user) {
        return next(null, user)
      }

      // NO USER
      console.log("nope, no user")
      return next(null, false, {
        message: "There is no user with that username and password."
      })
    })
  })
)

passport.use(
  "register",
  new LocalStrategy(function(username, password, next) {
    console.log(`registering a user with ${username} and ${password}`)

    // find a user in Mongo with provided username
    User.findOne({ username: username }, function(err, user) {
      // In case of any error, return using the next method
      if (err) {
        console.log("Error in SignUp: " + err)
        return next(err)
      }
      // already exists
      if (user) {
        console.log("User already exists with username: " + username)
        return next(null, false)
      } else {
        // if there is no user with that email
        // create the user
        var newUser = new User()

        // set the user's local credentials
        newUser.username = username
        newUser.password = createHash(password)

        // save the user
        newUser.save(function(err) {
          if (err) {
            console.log("Error in Saving user: " + err)
            throw err
          }
          console.log("User Registration succesful")
          return done(null, newUser)
        })
      }
    })
  })
)

// Generates hash using bCrypt
var createHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// freeze-dry the user
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

// Initialize password and use the session
app.use(passport.initialize()) //MW
app.use(passport.session()) //MW
// app.use(flash())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine("mustache", mustacheExpress())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

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
