Utils = function() {}

Utils.assert = function(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined")
      throw new Error(message);
  }
}

Utils.reOrderAndCenterNumbers = function(numbers, firstValue, modulo) {
  for (var i = 0; i < numbers.length; i++) {
    if (i > 0) {
      if (numbers[i] < numbers[i - 1])
        numbers[i] += modulo;
    }
    numbers[i] -= firstValue;
  }

  return numbers;
}

Utils.prepend = function(value, array) {
  var newArray = array.slice();
  newArray.unshift(value);
  return newArray;
}

Utils.formattedTime = function(time) {
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var usePM = false;
  if (hours > 11)
    usePM = true;
  hours = hours % 12;
  if (hours == 0)
    hours = 12;
  if (minutes < 10)
    minutes = "0" + minutes;

  return hours + ":" + minutes + (usePM ? " PM" : " AM");
}

Utils.dayNumberToString = function(dayNumber) {
  var weekday = new Array(7);
  weekday[0] =  "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[dayNumber];
}
