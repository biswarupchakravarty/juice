var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws_config.json');
var s3 = new AWS.S3(); 

router.get('/:url', function (req, res, next) {
  req.setEncoding('binary');
  var params = {
    Bucket: 'static.shiny.co.in', /* required */
    Key: 'images/' + req.params.url, /* required */
  };
  s3.getObject(params).createReadStream().pipe(res);
});

module.exports = router;
