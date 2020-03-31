var mongoose = require("mongoose");

var clientBaseSchema = new mongoose.Schema({
  phone: Number,
  name: String,
  bonus: Number,
  money: Number,
  bonusIndex: Number,
  percent: Number
});

module.exports = mongoose.model("dataBaseM", clientBaseSchema);
