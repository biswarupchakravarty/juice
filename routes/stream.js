var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/:image', function (req, res, next) {
  request('https://s3.amazonaws.com/static.shiny.co.in/images/' + req.params.image).pipe(res);
});

module.exports = router;