var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function (req, res, next) {
  request('https://s3.amazonaws.com/static.shiny.co.in/' + req.query.image).pipe(res);
});

module.exports = router;