const id = Number(document.querySelector("div[hidden]").textContent);

var minusString = "";
var plusString = "";
var kgString = "";
var btnString = "";
var setsString = "";
var itemsString = "";
var weightString = "";
var colorString = "";

var colors = ["olive", "yellow", "orange"];

for (var i = 1; i <= id; i++) {
  minusString += `#minus${[i]}, `;
  plusString += `#plus${[i]}, `;
  kgString += `#kg${[i]}, `;
  btnString += `#btn${[i]}, `;
  setsString += `#sets${[i]}, `;
  itemsString += `#item${[i]}, `;
  weightString += `#weight${i}, `;
  colorString += `#color${i}, `;
}

var minus = document.querySelectorAll(minusString.slice(0, -2));
var plus = document.querySelectorAll(plusString.slice(0, -2));
var kg = document.querySelectorAll(kgString.slice(0, -2));
var btn = document.querySelectorAll(btnString.slice(0, -2));
var sets = document.querySelectorAll(setsString.slice(0, -2));
var items = document.querySelectorAll(itemsString.slice(0, -2));
var weights = document.querySelectorAll(weightString.slice(0, -2));
var color = document.querySelectorAll(colorString.slice(0, -2));

minus.forEach(function(item, index) {
  item.addEventListener("click", function() {
    if (kg[index].textContent !== "0") {
      kg[index].innerHTML = Number(kg[index].textContent) - 1;
      weights[index].setAttribute("value", Number(kg[index].textContent));
    }
  });
});

plus.forEach(function(item, index) {
  item.addEventListener("click", function() {
    kg[index].innerHTML = Number(kg[index].textContent) + 1;
    weights[index].setAttribute("value", Number(kg[index].textContent));
  });
});

btn.forEach(function(item, index) {
  var idNum = Number(item.id.replace(/\D/g, "")) - 1;
  item.addEventListener("click", function() {
    if (sets[index].textContent > "1") {
      sets[index].innerHTML = Number(sets[index].textContent) - 1;
      color[index].setAttribute(
        "class",
        `ui label ${colors[Number(sets[index].textContent) - 1]}`
      );
    } else {
      console.log(item.id);
      var text = document.querySelectorAll(".header.completed")[idNum]
        .textContent;
      console.log(text);
      items[
        idNum
      ].innerHTML = `<h2 class='ui center aligned icon header completed'><i class='trophy icon' style="color:gold"></i></div>You have done "${text}"!</h2><input type="hidden" name="${idNum +
        1}[completed]" value="true"/>`;
    }
  });
});
