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
