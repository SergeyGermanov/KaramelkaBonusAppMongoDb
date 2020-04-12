var mongoose = require("mongoose");

var transSchema = new mongoose.Schema({
  date: String,
  moneySpend: String,
  money: String,
  bonus: String,
  bonusTotal: String,
});

module.exports = mongoose.model("Transactions", transSchema);
