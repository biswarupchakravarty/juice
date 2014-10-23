var mod_vasync = require('vasync');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();

var cache = {};

var Bundle = function (options) {
  this.type = options.type;
  this.name = options.name;
  this.files = options.files;
};

Bundle.prototype.compile = function (callback) {
  var result = [], that = this,
    handlers = this.files.map(function (file) {
      return that.getFileHandler(path.join(__dirname, '..', 'public', file))
    });
  mod_vasync.parallel({
    funcs: handlers,
  }, function (err, results) {
    results.operations.forEach(function (operation) {
      result.push(operation.result);
    });
    callback(result.join(''));
  });
};

Bundle.prototype.readFile = function (filePath, callback) {
  fs.readFile(filePath, callback);
};

Bundle.prototype.getFileHandler = function (filePath) {
  var that = this;
  return function fileHandler (callback) {
    if (typeof cache[filePath] !== "undefined") {
      setTimeout(function () {
        callback(null, cache[filePath]);
      });
    } else {
      that.readFile(filePath, function (err, contents) {
        if (app.get('env') !== 'development') {
          cache[filePath] = contents;
        }
        callback(null, contents);
      });
    }
  };
};

module.exports = Bundle;