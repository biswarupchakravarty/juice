var _ = require('lodash');
var NodeCache = require( "node-cache" );

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/private/aws_config.json');
var s3 = new AWS.S3(); 

var adminCache = new NodeCache();
var BUCKET_CONTENTS_KEY = 'contents_list';
var BUCKET_CONTENTS_TTL = 60 * 60;

var transformBucketListing = function (response) {
  var prefix = 'images/', empty = '';
  return _.chain(response['Contents'])
    .map(function (item) {
      return {
        name: item['Key'].replace(prefix, empty),
        updatedAt: new Date(item['LastModified']),
        size: item['Size']
      };
    })
    .reject({ name: empty })
    .value();
};

module.exports = controller = {

  clearContentsCache: function (callback) {
    adminCache.del(BUCKET_CONTENTS_KEY, callback);
  },

  getAllFiles: function (callback) {
    var params = { Bucket: 'static.shiny.co.in', Prefix: 'images/', Delimiter: 'images/' };
    adminCache.get(BUCKET_CONTENTS_KEY, function (err, value) {
      if (err) return callback(err);
      if (!_.isEmpty(value)) return callback(null, value[BUCKET_CONTENTS_KEY]);
      s3.listObjects(params, function(err, data) {
        data = transformBucketListing(data);
        if (err) return callback(err);
        adminCache.set(BUCKET_CONTENTS_KEY, data, BUCKET_CONTENTS_TTL);
        return callback(null, data);
      });
    });
  }

};