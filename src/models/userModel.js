// IMPORT MONGOOSE
const { default: mongoose } = require("mongoose");

// CREATE THE SCHEMA FOR THE USER TABLE
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  givenName: {
    type: String,
  },
  familyName: {
    type: String,
  },
  photoUrl: {
    type: String,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  photoUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
