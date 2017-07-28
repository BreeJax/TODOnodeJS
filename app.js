const express = require("express")
const mustacheExpress = require("mustache-express")
const app = express()

app.engine("mustache", mustacheExpress())

app.set("views", "./templates")
app.set("view engine", "mustache")
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render("index")
})

app.listen(3000, () => {
  console.log("I've got the magic in me!")
})
