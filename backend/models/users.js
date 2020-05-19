const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      unique: false,
      trim: false
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: false
    },
    dungeonMaster: {
      type: mongoose.ObjectId,
      required: true,
      trim: false
    },
    isDungeonMaster: {
      type: Boolean,
      required: true,
      trim: false
    }
  });

var User = mongoose.model("User", UserSchema);
module.exports = User;