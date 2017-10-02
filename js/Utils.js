Utils = function() {}

Utils.assert = function(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined")
      throw new Error(message);
  }
}