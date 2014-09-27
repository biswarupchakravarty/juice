var _ = require('lodash');
var NodeCache = require( "node-cache" );

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/private/aws_config.json');
var s3 = new AWS.S3(); 

var adminCache = new NodeCache();
var BUCKET_CONTENTS_KEY = 'contents_list';
var BUCKET_CONTENTS_TTL = 60 * 60;

module.exports = controller = {

  show: function (callback) {
    
  }

};