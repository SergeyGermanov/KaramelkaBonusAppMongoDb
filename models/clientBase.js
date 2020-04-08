var mongoose = require("mongoose");

var clientBaseSchema = new mongoose.Schema({
  phone: Number,
  name: String,
  bonus: Number,
  money: Number,
  bonusIndex: Number,
  percent: Number,
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transactions",
    },
  ],
});

module.exports = mongoose.model("dataBaseM", clientBaseSchema);
