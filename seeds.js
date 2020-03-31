var mongoose = require("mongoose");
var clientBase = require("./models/clientBase");

var data = [
  {
    phone: 79059847682,
    name: "Сергей Германов",
    bonus: 1000,
    money: 1000,
    bonusIndex: 25,
    percent: 10
  },
  {
    phone: 79039109829,
    name: "Алексей Германов",
    bonus: 3000,
    money: 1000,
    bonusIndex: 10,
    percent: 25
  }
];

function seedDB() {
  //Remove all client
  //   clientBase.remove({}, function(err) {
  //     if (err) {
  //       console.log(err);
  //     }
  //     console.log("removed clients!");
  //add a few client
  data.forEach(function(seed) {
    clientBase.create(seed, function(err, client) {
      if (err) {
        console.log(err);
      } else {
        console.log("added a client");
      }
    });
  });
  //   });
}

module.exports = seedDB;
