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

const todos = []

app.get("/", (req, res) => {
  console.log("test one")
  res.render("index", { todos: todos })
})

app.post("/", (req, res) => {
  console.log("test two")
  console.log(req.body.todos)
  todos.push(req.body.todos)
  res.redirect("/")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
