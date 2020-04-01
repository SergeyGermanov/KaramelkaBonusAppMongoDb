const bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  dataBaseM = require("./models/clientBase"),
  seedDb = require("./seeds"),
  querystring = require("querystring"),
  dotenv = require("dotenv"),
  app = express();

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err));
mongoose.set("useFindAndModify", false);

app.set("port", process.env.PORT || 8080);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// seedDb();

// var dataBase = {
//   79059847682: {
//     name: "Сергей Германов",
//     bonus: 1000,
//     money: 1000,
//     bonusIndex: 25,
//     percent: 10
//   },
//   79039109829: {
//     name: "Алексей Германов",
//     bonus: 3000,
//     money: 1000,
//     bonusIndex: 10,
//     percent: 25
//   }
// };

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

app.get("/client", function(req, res) {
  if (phNumber && data) {
    res.render("client", { phNumber: phNumber, data: data, message: message });
    message = {};
  } else {
    res.redirect("/");
  }
});

app.post("/client", function(req, res) {
  data.bonusIndex = Number(req.body.bonusIndex);
  data.percent = Number(req.body.percent);

  var bonus = Number(req.body.bonus) / data.bonusIndex;
  var percent = (Number(req.body.bonus) * Number(req.body.percent)) / 100;
  var bonusPercent = data.bonus - Math.round(percent);

  if (req.body.action === "deposit") {
    data.bonus += Math.round(bonus);
    data.money += Number(req.body.bonus);
    message = {
      fullPay: req.body.bonus,
      bonus: Math.round(bonus),
      action: "deposit"
    };
  } else {
    if (bonusPercent < 0) {
      data.money += Math.abs(bonusPercent);
      message = {
        fullPay: req.body.bonus,
        bonus: data.bonus,
        pay: req.body.bonus - data.bonus,
        action: "withdraw"
      };
      data.bonus = 0;
    } else {
      data.bonus -= Math.round(percent);
      data.money += Number(req.body.bonus) - Math.round(percent);
      message = {
        fullPay: req.body.bonus,
        bonus: Math.round(percent),
        pay: Number(req.body.bonus) - Math.round(percent),
        action: "withdraw"
      };
    }
  }

  dataBaseM.findOneAndUpdate({ phone: idPhone }, data, function(err, update) {
    if (err) {
      message = {
        error: err,
        action: "error"
      };
      console.log(`Clent ${data.name} NOT updated`);
      res.redirect("/client");
    } else {
      //redirect somewhere(show page)
      console.log(`Clent ${data.name} updated`);
      res.redirect("/client");
    }
  });
});

app.get("/create", function(req, res) {
  res.render("create");
});

app.post("/create", function(req, res) {
  var clientCreated = {};
  idPhone = req.body.telNo.replace(/[^\d.]/g, "");

  delete req.body.telNo;

  clientCreated = req.body;
  clientCreated.phone = Number(idPhone);
  clientCreated.money = Number(req.body.bonus);
  clientCreated.bonusIndex = Number(req.body.bonusIndex);
  clientCreated.percent = Number(req.body.percent);
  clientCreated.bonus = Math.floor(
    Number(req.body.bonus) / Number(req.body.bonusIndex)
  );

  if (dataBaseM.exists({ phone: idPhone })) {
    console.log(
      `Клиент с номером +${idPhone} уже существует. Введите другой номер.`
    );
  } else {
    dataBaseM.create(clientCreated, function(err, client) {
      if (err) {
        console.log(err);
        res.redirect("/create");
      } else {
        console.log("added a client");
        res.redirect("/create");
      }
    });
  }
});

app.listen(app.get("port"), function() {
  console.log("Express started on http://localhost:" + app.get("port"));
});
