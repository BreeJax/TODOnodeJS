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

let todos = []
let fintodos = []

app.get("/", (req, res) => {
  res.render("index", { todos: todos, fintodos: fintodos })
})

app.post("/", (req, res) => {
  todos.push(req.body.todos)

  res.redirect("/")
})

app.post("/completed", (req, res) => {
  var todoIndex = todos.indexOf(req.body.submitedTodo)
  todos.splice(todoIndex)
  fintodos.push(req.body.submitedTodo)
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
