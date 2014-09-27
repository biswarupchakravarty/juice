var express = require('express');
var router = express.Router();
var _ = require('lodash');
var JuicedImage = require('../models/juicedImage');

var controller = require('../controllers/admin/admin.js');

require('mongoose').connect('mongodb://localhost/myapp');

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
      label: 'All Juiced Images',
      action: '/juiced-images'
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


router.get('/', executeBeforeFilters, function(req, res) {
  var data = {};
  res.render('admin/index', {
    title: 'Admin Panel',
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
      res.render('admin/files/index', {
        title: 'POPPPPP',
        files: files
      });
    });
  }
});

router.get('/files/:image', executeBeforeFilters, function (req, res, next) {
  res.locals.image = req.params.image;
  res.render('admin/files/show', {
    title: 'Edit File'
  });
});

router.get('/juiced-images/new', executeBeforeFilters, function (req, res, next) {
  res.locals.file = req.param('file');
  res.render('admin/juiced/new', {
    title: 'Create New Juiced Image'
  });
});

router.post('/juiced-images/new', executeBeforeFilters, function (req, res, next) {
  JuicedImage.find({ name: req.body.name }, function (err, images) {
    if (err) return next(err);
    if (images.length !== 0) {
      return res.render('admin/juiced/new', {
        title: 'Create New Juiced Image',
        file: req.body.file,
        imageNameTaken: true
      });
    }
    new JuicedImage({
      path: req.body.file,
      name: req.body.name
    }).save(function (err, file) {
      if (err) return next(err);
      res.redirect('/admin/juiced-images/');
    });
  });
});

router.get('/juiced-images', executeBeforeFilters, function (req, res, next) {
  JuicedImage.find(function (err, images) {
    if (err) return next(err);
    res.render('admin/juiced/index', {
      title: 'All Juiced Images',
      images: images
    });
  });
});

module.exports = router;