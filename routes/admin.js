var express = require('express');
var router = express.Router();
var knox = require('knox');
var _ = require('lodash');
var NodeCache = require( "node-cache" );

var adminCache = new NodeCache();

var client = knox.createClient({
  key: 'AKIAJ5FMVJ3FHNCC357Q',
  secret: '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',
  bucket: 'static.shiny.co.in'
});

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/private/aws_config.json');
var s3 = new AWS.S3(); 



var beforeFilters = [];

var executeBeforeFilters = function (req, res, next) {
  _.each(beforeFilters, function (filter) {
    filter(req, res);
  });
  next();
};

beforeFilters.push(function prepareNavLinks(req, res) {
  if (req.xhr) return;
  _.merge(res.locals, {
    navigationLinks: [{
      label: 'Dashboard',
      action: '/'
    }, {
      label: 'All Files',
      action: '/files'
    }]
  });
});


beforeFilters.push(function setCurrentAction(req, res) {
  if (req.xhr) return;
  var tokens = _.where(req.path.split('/'), function (token) {
    return token.trim().length > 0
  });
  _.merge(res.locals, {
    action: (req.path === '/') ? '/' : '/' + tokens[tokens.length - 1]
  });
});


/* GET home page. */
router.get('/', executeBeforeFilters, function(req, res) {
  var data = {};
  res.render('admin/files', {
    title: 'Admin Panel',
    user: {
      name: 'Biswarup Chakravarty'
    },
    details: JSON.stringify(data, null, 2)
  });
});

var transform = function (response) {
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

var BUCKET_CONTENTS_KEY = 'contents_list';
var BUCKET_CONTENTS_TTL = 60 * 60;

var getFiles = function (callback, options) {
  var params = { Bucket: 'static.shiny.co.in', Prefix: 'images/', Delimiter: 'images/' };
  adminCache.get(BUCKET_CONTENTS_KEY, function (err, value) {
    if (err) return callback(err);
    if (!_.isEmpty(value)) return callback(null, value[BUCKET_CONTENTS_KEY]);
    s3.listObjects(params, function(err, data) {
      data = transform(data);
      if (err) return callback(err);
      adminCache.set(BUCKET_CONTENTS_KEY, data, BUCKET_CONTENTS_TTL);
      return callback(null, data);
    });
  });
};


router.get('/files/', executeBeforeFilters, function (req, res, next) {
  if (req.query.refresh === 'true') {
    adminCache.del(BUCKET_CONTENTS_KEY, function () {
      res.redirect('/admin/files/');
    });
  } else {
    getFiles(function (err, files) {
      if (err) return next(err);
      res.render('admin/files', {
        title: 'POPPPPP',
        files: files
      });
    });
  }
});


module.exports = router;


/* `data` will look roughly like:
// client.list({ prefix: '' }, function (err, data) {
{
  Prefix: 'my-prefix',
  IsTruncated: true,
  MaxKeys: 1000,
  Contents: [
    {
      Key: 'whatever'
      LastModified: new Date(2012, 11, 25, 0, 0, 0),
      ETag: 'whatever',
      Size: 123,
      Owner: 'you',
      StorageClass: 'whatever'
    },
    ⋮
  ]
}
*/
// });