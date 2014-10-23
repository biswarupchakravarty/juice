var _ = require('lodash');

var FilterCollection = function () {
  var that = this;

  that.filters = [];
  that.execute = function () {
    that._execute.apply(that, arguments);
  }
};

FilterCollection.prototype._execute = function (req, res, next) {
  this.filters.forEach(function (filter) {
    filter(req, res);
  });
  next();
};

FilterCollection.prototype.register = function (func) {
  if (typeof func !== "function") return;
  this.filters.push(func);
};

module.exports = FilterCollection;