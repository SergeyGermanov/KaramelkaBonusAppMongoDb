function date() {
  var months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Майя",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];
  var today = new Date();
  var date = `${today.getDate()}-${
    months[today.getMonth()]
  }-${today.getFullYear()}`;
  var time = today.toJSON().slice(11, 19);

  return `${date} ${time}`;
}

module.exports = date;
