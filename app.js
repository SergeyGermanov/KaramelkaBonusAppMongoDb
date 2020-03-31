const bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  dataBaseM = require("./models/clientBase"),
  seedDb = require("./seeds"),
  querystring = require("querystring"),
  app = express();

const db =
  "mongodb+srv://sergyleo:Scarab_82@cluster0-bbl44.mongodb.net/test?retryWrites=true&w=majority";

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err));

app.set("port", process.env.PORT || 8080);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// seedDb();

var dataBase = {
  79059847682: {
    name: "Сергей Германов",
    bonus: 1000,
    money: 1000,
    bonusIndex: 25,
    percent: 10
  },
  79039109829: {
    name: "Алексей Германов",
    bonus: 3000,
    money: 1000,
    bonusIndex: 10,
    percent: 25
  }
};

var phNumber;
var idPhone;
var data;
var message;

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/", function(req, res) {
  phNumber = req.body.telNo;
  idPhone = phNumber.replace(/[^\d.]/g, "");

  dataBaseM.findOne({ phone: idPhone }, function(err, client) {
    if (err) {
      console.log(err);
    } else {
      data = client;
      res.redirect("/client");
    }
  });
});

// app.post("/", function(req, res) {
//   phNumber = req.body.telNo;
//   idPhone = phNumber.replace(/[^\d.]/g, "");

//   if (dataBase[idPhone]) {
//     data = dataBase[idPhone];
//     // need to check it carefully
//   } else {
//   }
//   res.redirect("/client");
// });

app.get("/client", function(req, res) {
  if (phNumber && data) {
    res.render("client", { phNumber: phNumber, data: data, message: message });
    message = {};
  } else {
    res.redirect("/");
  }
});

app.post("/client", function(req, res) {
  dataBase[idPhone].bonusIndex = Number(req.body.bonusIndex);
  dataBase[idPhone].percent = Number(req.body.percent);

  var bonus = Number(req.body.bonus) / dataBase[idPhone].bonusIndex;
  var percent = (Number(req.body.bonus) * Number(req.body.percent)) / 100;
  var bonusPercent = dataBase[idPhone].bonus - Math.round(percent);

  if (req.body.action === "deposit") {
    dataBase[idPhone].bonus += Math.round(bonus);
    dataBase[idPhone].money += Number(req.body.bonus);
    message = {
      fullPay: req.body.bonus,
      bonus: Math.round(bonus),
      action: "deposit"
    };
  } else {
    if (bonusPercent < 0) {
      dataBase[idPhone].money += Math.abs(bonusPercent);
      message = {
        fullPay: req.body.bonus,
        bonus: dataBase[idPhone].bonus,
        pay: req.body.bonus - dataBase[idPhone].bonus,
        action: "withdraw"
      };
      dataBase[idPhone].bonus = 0;
    } else {
      dataBase[idPhone].bonus -= Math.round(percent);
      dataBase[idPhone].money += Number(req.body.bonus) - Math.round(percent);
      message = {
        fullPay: req.body.bonus,
        bonus: Math.round(percent),
        pay: Number(req.body.bonus) - Math.round(percent),
        action: "withdraw"
      };
    }
  }

  res.redirect("/client");
});

app.get("/create", function(req, res) {
  res.render("create");
});

app.post("/create", function(req, res) {
  var clientCreated = {};
  idPhone = req.body.telNo.replace(/[^\d.]/g, "");

  delete req.body.telNo;

  // var bonus = Math.floor(Number(req.body.bonus) / Number(req.body.bonusIndex));

  clientCreated = req.body;
  clientCreated.phone = Number(idPhone);
  clientCreated.money = Number(req.body.bonus);
  clientCreated.bonusIndex = Number(req.body.bonusIndex);
  clientCreated.percent = Number(req.body.percent);
  clientCreated.bonus = Math.floor(
    Number(req.body.bonus) / Number(req.body.bonusIndex)
  );

  console.log(req.body);
  console.log(clientCreated);
  console.log(clientCreated.phone);
  console.log(idPhone);
  // dataBase[idPhone] = req.body;
  // dataBase[idPhone].money = Number(req.body.bonus);
  // dataBase[idPhone].bonusIndex = Number(req.body.bonusIndex);
  // dataBase[idPhone].percent = Number(req.body.percent);
  // dataBase[idPhone].bonus = bonus;

  dataBaseM.create(clientCreated, function(err, client) {
    if (err) {
      console.log(err);
      res.redirect("/create");
    } else {
      console.log("added a client");
      res.redirect("/");
    }
  });

  // if (dataBase[idPhone]) {
  //   res.redirect("/");
  // } else {
  //   res.redirect("/create");
  // }
});

app.listen(app.get("port"), function() {
  console.log("Express started on http://localhost:" + app.get("port"));
});
