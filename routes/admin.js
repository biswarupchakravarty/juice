var express = require('express');
var router = express.Router();
var knox = require('knox');
var _ = require('lodash');

var controller = require('../controllers/admin.js');

var client = knox.createClient({
  key: 'AKIAJ5FMVJ3FHNCC357Q',
  secret: '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',
  bucket: 'static.shiny.co.in'
});

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

router.get('/files/', executeBeforeFilters, function (req, res, next) {
  if (req.query.refresh === 'true') {
    return controller.clearContentsCache(function () {
      res.redirect(req.baseUrl + req.path);
    });
  } else {
    return controller.getAllFiles(function (err, files) {
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