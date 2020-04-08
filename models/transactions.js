var mongoose = require("mongoose");

var transSchema = new mongoose.Schema({
  date: String,
  money: String,
  bonus: String,
});

module.exports = mongoose.model("Transactions", transSchema);
