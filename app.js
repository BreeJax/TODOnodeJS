const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const app = express()

app.engine("mustache", mustacheExpress())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

//req, res cycle- youre browser sends  a request to "/", and gets back a responce.

let todos = [] //array that we are pulling from
let fintodos = [] //where we will end up pulling
// res.send("Hello world") <-- this is a test so that you can see if you are connected properly -- used before you have templates. Also, this is a string.

app.get("/", (req, res) => {
  // console.log(`${req.connection.remoteAddress} connected and ask for /`) <- connects to the server. ${req.connection.remoteAddress} shows who is asking for access
  //When Gavin did this in class, we were the requesters and his machine was the responder.
  //to find out your IP address, in terminal type in "ifconfig"
  //There can ONLY BE ONE RENDER
  res.render("index", { todos: todos, fintodos: fintodos }) //<-- it already learned where the templates were, but this tells it which one to render. you should always have everything inside of one folder, not multiple folders OF templates. we do not have /index because this is NOT part of the URL. This determins what the user sees when they look for / in the URL. The client won't see that we named this "Index" - thats because that is just for us/ a detail for the server. They are looking for /.
  // the {object} the keys of the variable are what the mustach can see, the values are what inside of those variables.
})

app.post("/", (req, res) => {
  todos.push(req.body.todos)

  res.redirect("/")
})

//post= giving info to the server

app.post("/completed", (req, res) => {
  var todoIndex = todos.indexOf(req.body.submitedTodo)
  todos.splice(todoIndex)
  fintodos.push(req.body.submitedTodo)
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
