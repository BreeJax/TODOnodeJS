const mongoose = require("mongoose")
const findOrCreate = require("mongoose-findorcreate")
const bcrypt = require("bcryptjs")

mongoose.promise = global.promise
mongoose.connect("mongodb://localhost:27017/todoUsers")

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, lowercase: true, required: true },
  passwordHash: { type: String, required: true }
})

userSchema
  .virtual("password") ///GETS AND SETS
  .get(function() {
    return null
  })
  .set(function(plainTextPassword) {
    this.passwordHash = bcrypt.hashSync(plainTextPassword, 8)
  })

// Compares this password (plain) to the one for the user
userSchema.methods.authenticate = function(password) {
  // compare                plaintext to   encrypted
  //
  // This is done by comparing the plain text password after hashing to the hashed password

  return bcrypt.compareSync(password, this.passwordHash)
  //this is the Getter method ************
}

// Given a username and plain text password, can we find a user
// with that username, AND then when we encrypt that password
// does it match
userSchema.statics.authenticate = function(username, password, next) {
  // First, find the user with that name
  this.findOne(
    {
      username: username
    },
    function(err, user) {
      // NOW, see if that user authenticates with that password
      // If there was an error, bail
      if (err) {
        // MONGO ERROR HAPPENED, ZOMG
        next(err, false)
        // If there is a user AND that user's password matches, then SUCCESS
      } else if (user && user.authenticate(password)) {
        // SUCCESS authenticate
        next(null, user)
      } else {
        // BOOO, authentication failure
        next(null, false)
      }
    }
  )
}

userSchema.plugin(findOrCreate)

const User = mongoose.model("User", userSchema)

module.exports = User
