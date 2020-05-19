const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var WeaponSchema = new Schema({
    itemType: {
        type: String,
        required: false, //*
        unique: false,
        trim: false
    },
    name: {
        type: String,
        required: false, //*
        unique: false, //*
        trim: false
    },
    damageType: {
      type: String,
      required: false, //*
      unique: false,
      trim: false
    },
    style: {
      type: String,
      required: false, //*
      unique: false,
      trim: false
    },
    properties: {
        type: String,
        required: false,
        unique: false,
        trim: false
    },
    range: {
        type: String,
        required: false, //*
        unique: false,
        trim: false
    },
    damage: {
        type: String,
        required: false //*
    },
    user: {
        type: mongoose.ObjectId,
        required: false,
        trim: false
    }
  });

var Weapon = mongoose.model("Weapon", WeaponSchema);
module.exports = Weapon;