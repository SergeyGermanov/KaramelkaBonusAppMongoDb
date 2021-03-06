const bodyParser = require("body-parser"),
  express = require("express"),
  mongoose = require("mongoose"),
  dataBaseM = require("./models/clientBase"),
  Transactions = require("./models/transactions"),
  seedDb = require("./seeds"),
  date = require("./date"),
  querystring = require("querystring"),
  dotenv = require("dotenv"),
  app = express();

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);

app.set("port", process.env.PORT || 8080);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// seedDb();

let phNumber;
let idPhone;
let data;
let message;
let arrTrans = [];

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/", function (req, res) {
  phNumber = req.body.telNo;
  idPhone = phNumber.replace(/[^\d.]/g, "");

  dataBaseM.findOne({ phone: idPhone }, function (err, client) {
    if (err) {
      console.log(err);
    } else {
      data = client;
      res.redirect("/client");
    }
  });
});

app.get("/client", function (req, res) {
  if (phNumber && data) {
    res.render("client", { phNumber: phNumber, data: data, message: message });
    message = {};
  } else {
    res.redirect("/");
  }
});

app.post("/client", function (req, res) {
  data.bonusIndex = Number(req.body.bonusIndex);
  data.percent = Number(req.body.percent);

  var bonus = bonusFunc(req.body.bonus, data.bonusIndex);

  var percent = percentFunc(req.body.bonus, req.body.percent);

  var bonusPercent = bonusPercentFunc(data.bonus, percent);

  var sign = "+";
  var bonusTrans;
  var moneySpend = req.body.bonus;

  if (req.body.action === "deposit") {
    data.bonus += Math.round(bonus);
    data.money += Number(req.body.bonus);
    bonusTrans = Math.round(bonus);

    message = messageClient(Math.round(bonus), "deposit");
  } else {
    if (bonusPercent < 0) {
      sign = "-";
      data.money += Math.abs(bonusPercent);
      bonusTrans = data.bonus;

      let pay = req.body.bonus - data.bonus;
      message = messageClient(data.bonus, "withdraw", pay, req.body.bonus);

      data.bonus = 0;
    } else {
      sign = "-";
      data.bonus -= Math.round(percent);
      data.money += Number(req.body.bonus) - Math.round(percent);
      bonusTrans = Math.round(percent);

      let pay = Number(req.body.bonus) - Math.round(percent);
      message = messageClient(
        Math.round(percent),
        "withdraw",
        pay,
        req.body,
        bonus
      );
    }
  }
  let transactionData = {
    date: date(),
    moneySpend: `+${moneySpend}`,
    money: `${data.money}`,
    bonus: `${sign}${bonusTrans}`,
    bonusTotal: data.bonus,
  };

  dataBaseM.findOneAndUpdate({ phone: idPhone }, data, function (err, update) {
    if (err) {
      message = {
        error: err,
        action: "error",
      };
      console.log(`Clent ${data.name} NOT updated`);
      res.redirect("/client");
    } else {
      Transactions.create(transactionData, function (err, transaction) {
        if (err) {
          console.log(err);
        } else {
          // create array and then push all elements of it to mongoDb
          arrTrans.push(transaction);

          arrTrans.forEach((el) => {
            update.transactions.push(el);
          });
          update.save();

          console.log("Created new transaction");
        }
      });
      //redirect somewhere(show page)
      console.log(`Clent ${data.name} updated`);
      res.redirect("/client");
    }
  });
});

app.get("/create", function (req, res) {
  res.render("create", { message: message });
  message = {};
});

app.post("/create", function (req, res) {
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

  //check if this phone number exists
  var clientExists = (data) =>
    dataBaseM.findOne(data).then((token) => {
      return token;
    });

  clientExists({ phone: idPhone }).then(function (result) {
    // if exists show an alert message
    if (result) {
      message = {
        phone: idPhone,
        action: "error",
      };
      res.redirect("/create");
    } else {
      // if does not add it
      message = {
        phone: idPhone,
        action: "added",
      };

      let transactionData = {
        date: date(),
        moneySpend: `+${clientCreated.money}`,
        money: `${clientCreated.money}`,
        bonus: `+${clientCreated.bonus}`,
        bonusTotal: `+${clientCreated.bonus}`,
      };

      dataBaseM.create(clientCreated, function (err, client) {
        if (err) {
          console.log(err);
          res.redirect("/create");
        } else {
          Transactions.create(transactionData, function (err, transaction) {
            if (err) {
              console.log(err);
            } else {
              client.transactions.push(transaction);
              client.save();
              console.log("Created new transaction");
            }
          });
          console.log("added a client");
          res.redirect("/create");
        }
      });
    }
  });
});

app.get("/list", function (req, res) {
  dataBaseM
    .find({})
    //add transactions to the main database
    .populate("transactions")
    .exec((err, list) => {
      err ? console.log(err) : res.render("list", { list: list });
    });
});

app.listen(app.get("port"), function () {
  console.log("Express started on http://localhost:" + app.get("port"));
});

// functions to refractor
// client POST functions
const bonusFunc = (bonus, bonusIndex) => {
  return Number(bonus) / bonusIndex;
};

const percentFunc = (bonus, percent) => {
  return (Number(bonus) * Number(percent)) / 100;
};

const bonusPercentFunc = (bonus, percent) => {
  return bonus - Math.round(percent);
};
// client POST functions

// message Obj creator
const messageClient = (
  bonus = null,
  action = null,
  pay = null,
  fullPay = null
) => {
  return { bonus: bonus, action: action, pay: pay, fullPay: fullPay };
};
