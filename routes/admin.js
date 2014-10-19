var express = require('express');
var router = express.Router();
var _ = require('lodash');
var JuicedImage = require('../models/juicedImage');
var fs = require('fs');
var path = require('path');
var sizeOf = require('image-size');
var Q = require('q');

var CONSTANTS = {
  S3_BUCKET: 'static.shiny.co.in'
}

var mod_vasync = require('vasync');
var mod_util = require('util');

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/private/aws_config.json');
var s3 = new AWS.S3(); 

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
      label: 'New File',
      action: '/new'
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

router.get('/templates/forms/:type', function (req, res, next) {
  res.render('admin/annotations/partials/' + req.params.type + '/form');
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

router.get('/files/:id', executeBeforeFilters, function (req, res, next) {
  JuicedImage.find({ _id: req.params.id }, function (err, images) {
    if (err) return next(err);
    if (images.length === 0) return next();
    var image = images[0];
    res.render('admin/files/show', {
      title: 'Edit File',
      image: image
    });
  });
});

router.post('/files/:id/annotations', executeBeforeFilters, function (req, res, next) {
  JuicedImage.update({ _id: req.params.id }, { annotations: req.body.annotations }, function (err, image) {
    if (err) return next(err);
    res.end(JSON.stringify({ err: null }));
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

var removeJuicedImage = function (id, callback) {
  JuicedImage.find({ _id: id }, function (err, image) {
    if (err) return callback(err);
    if (image.length !== 0) return callback(new Error('Could not find document with id: ' + id));
    mod_vasync.parallel({
      funcs: [
        function (callback) {
          s3.deleteObject({
            Bucket: CONSTANTS.S3_BUCKET,
            Key: image[0].path
          }, callback);
        }, function (callback) {
          JuicedImage.remove({ _id: id }, callback);
        }
      ]
    }, callback);
  });
};

router.get('/juiced-images/delete', executeBeforeFilters, function (req, res, next) {
  removeJuicedImage(req.query.fileId, function (err) {
    if (err) return next(err);
    res.redirect('back');
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

router.get('/new', executeBeforeFilters, function (req, res, next) {
  res.render('admin/files/new', {
    title: 'New File'
  });
});

var fileToImage = function (localFilePath, remoteFileName, localFileName, callback) {
  var uploadFile = function (callback) {
    uploadLocalFileToS3(localFilePath, remoteFileName, callback);
  }, readImageSize = function (callback) {
    sizeOf(localFilePath, callback);
  }, createJuicedImage = function (options, callback) {
    createNewJuicedImage(options, callback);
  };

  mod_vasync.parallel({
    funcs: [uploadFile, readImageSize]
  }, function (err, results) {
    if (err) return callback(err);
    createJuicedImage({
      name: remoteFileName,
      path: 'images/' + remoteFileName,
      extension: results.operations[1].result.type,
      dimensions: {
        height: results.operations[1].result.height,
        width: results.operations[1].result.width,
      }
    }, callback);
  });
};

var uploadLocalFileToS3 = function (localFilePath, remoteFileName, callback) {
  fs.readFile(localFilePath, function (err, buffer) {
    if (err) return next(err);
    s3.putObject({
      ACL: 'public-read',
      Bucket: CONSTANTS.S3_BUCKET,
      Key: 'images/' + remoteFileName,
      Body: buffer,
      ContentType: 'image/jpg'
    }, callback);
  });
};

var createNewJuicedImage = function (options, callback) {
  var jImage = new JuicedImage(options);
  return jImage.save(function (err, file) {
    if (err) return callback(err);
    return callback(null, jImage);
  });
};

var writeFileToDisk = function (savedFileName, file, callback) {
  var fstream = fs.createWriteStream(savedFileName);
  file.pipe(fstream);
  fstream.on('close', function (err) {
    if (err) return callback(err);
    return callback(null);
  });
};

router.post('/new', executeBeforeFilters, function (req, res, next) {
  var savedFileName, incomingFileName;

  req.pipe(req.busboy);
  req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    incomingFileName = val.toString('utf8');
  });

  req.busboy.on('file', function (fieldname, file, filename) {
    savedFileName = path.normalize(__dirname + '/../' + filename);
    writeFileToDisk(savedFileName, file, function (err) {
      if (err) return next(err);
      fileToImage(savedFileName, incomingFileName, filename, function (err, file) {
        if (err) return next(err);
        res.redirect('/admin/files/' + file._id);
      });
    });      
  });
});

module.exports = router;