var mod_vasync = require('vasync');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var jade = require('jade');
var minify = require('minify');

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
    callback(result.join('\n'));
  });
};

Bundle.prototype.readFile = function (filePath, callback) {
  var temp;

  fs.readFile(filePath, function (err, contents) {
    if (filePath.indexOf('.jade') !== -1)
      callback(null, jade.compile(contents)());
    else
      callback(null, contents);
  });
};

Bundle.prototype.minify = function (contents, fileType, filePath, callback) {
  if (['js', 'css'].indexOf(fileType) === -1 || filePath.indexOf('.min.') !== -1 || app.get('env') === 'development') {
    return callback(null, contents);
  } else {
    return minify({
      ext: '.' + fileType,
      data: contents.toString('utf8')
    }, callback);
  }
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
        that.minify(contents, that.type, filePath, function (err, contents) {
          if (err) throw err;
          if (app.get('env') !== 'development') {
            cache[filePath] = contents;
          }
          callback(null, contents.toString());
        });
      });
    }
  };
};

module.exports = Bundle;