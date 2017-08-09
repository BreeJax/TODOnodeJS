const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const jsonfile = require("jsonfile")
const expressSession = require("express-session")

const app = express()

app.use(
  expressSession({
    secret: "LoveForAll",
    resave: false,
    saveUninitialized: true
  })
)

let users = {
  users: [
    { id: 1, userName: "Gavin", password: "Panda_Jarvis" },
    { id: 2, userName: "Jason", password: "Platypus" },
    { id: 3, userName: "Mark", password: "Decimal" },
    { id: 4, userName: "Angel", password: "Lifeguard" }
  ]
}
let authentication = (req, res, next) => {
  if (req.session && req.session.user) {
    next()
  } else {
    res.redirect("login")
  }
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine("mustache", mustacheExpress())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

app.get("/login", (req, res) => {
  const userName = req.query.userName
  const password = req.query.password

  let person = users.users.find(user => {
    return user.userName === userName && user.password === password
  })

  if (!!person) {
    req.session.user = person
    res.redirect("/")
  } else {
    res.render("login")
  }
})
app.use(authentication)
//req, res cycle- youre browser sends  a request to "/", and gets back a responce.
app.get("/", (req, res) => {
  const user = req.session.user
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
