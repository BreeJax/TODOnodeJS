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

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine("mustache", mustacheExpress())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

//req, res cycle- youre browser sends  a request to "/", and gets back a responce.

//let todos = [] //array that we are pulling from
//let fintodos = [] //where we will end up pulling
// res.send("Hello world") <-- this is a test so that you can see if you are connected properly -- used before you have templates. Also, this is a string.

app.get("/", (req, res) => {
  const todos = req.session.todos || []

  const todoData = {
    todos: todos.filter(todos => !todos.completed),
    fintodos: todos.filter(todos => todos.completed)
  }

  // console.log(`${req.connection.remoteAddress} connected and ask for /`) <- connects to the server. ${req.connection.remoteAddress} shows who is asking for access
  //When Gavin did this in class, we were the requesters and his machine was the responder.
  //to find out your IP address, in terminal type in "ifconfig"
  //There can ONLY BE ONE RENDER
  res.render("index", todoData) //<-- it already learned where the templates were, but this tells it which one to render. you should always have everything inside of one folder, not multiple folders OF templates. we do not have /index because this is NOT part of the URL. This determins what the user sees when they look for / in the URL. The client won't see that we named this "Index" - thats because that is just for us/ a detail for the server. They are looking for /.
  // the {object} the keys of the variable are what the mustach can see, the values are what inside of those variables.
})

app.post("/", (req, res) => {
  const todos = req.session.todos || []
  const description = req.body.description

  todos.push({ id: todos.length + 1, completed: false, description: description })
  req.session.todos = todos
  res.redirect("/")
})

//post= giving info to the server

app.post("/completed", (req, res) => {
  const todos = req.session.todos || []
  console.dir(req.session.todos)
  const id = parseInt(req.body.id)
  let fintodos = todos.find(todos => todos.id === id)
  if (fintodos) {
    fintodos.completed = true
    fintodos.when = new Date()
    req.session.todos = todos
  }
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
