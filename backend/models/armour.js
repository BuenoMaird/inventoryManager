const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ArmourSchema = new Schema({
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
    armourCategory: {
        type: String,
        required: false, //*
        unique: false,
        trim: false
    },
    armourClass: {
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
    minStrength: {
        type: Buffer,
        required: false, //*
        unique: false,
        trim: false
    },
    stealthDisadvantage: {
        type: Boolean,
        required: false //*
    },
    user: {
        type: mongoose.ObjectId,
        required: false,
        trim: false
    }
  });

var Armour = mongoose.model("Armour", ArmourSchema);
module.exports = Armour