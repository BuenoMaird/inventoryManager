var WeaponSchema = require('../models/weapon').schema;
var ArmourSchema = require('../models/armour').schema;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var EquipmentSchema = new Schema({
    creator: {
        type: mongoose.ObjectId,
        required: true

    },
    cost: {
      type: String,
      required: true,
      unique: false,
      trim: false
    },
    weight: {
      type: String,
      required: true,
      unique: false,
      trim: false
    },
    classification: [WeaponSchema, ArmourSchema]
  });

var Equipment = mongoose.model("Equipment", EquipmentSchema);
module.exports = Equipment;