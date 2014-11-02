var Bundle = require('../lib/bundle');
var BUNDLES = require('../lib/bundles/main.js');
var SUPPORTED_BUNDLE_TYPES = ['css', 'js'];
var _ = require('lodash');

var controller = {

  isValidBundle: function (bundle) {
    if (!bundle) return false;
    return (typeof bundle.files !== "undefined");
  },

  parse: function (url) {
    var tokens = url.split('/').filter(function (token) {
      return token.trim().length > 0;
    }), parsedBundle;

    if (!BUNDLES[tokens[0]] || !BUNDLES[tokens[0]][tokens[1]]) return false;
    parsedBundle = new Bundle({
      type: tokens[0],
      name: tokens[1],
      files: BUNDLES[tokens[0]][tokens[1]]
    });
    parsedBundle = controller.expand(parsedBundle);
    return parsedBundle;
  },

  expand: function (compositeBundle) {
    var files = [], tokens;
    if (compositeBundle.type !== 'pages') return compositeBundle;
    _.each(compositeBundle.files, function (file) {
      tokens = file.split('/');
      files = files.concat(BUNDLES[tokens[2]][tokens[3]]);
    });
    compositeBundle.files = files;
    return compositeBundle;
  },

  getContentType: function (bundle) {
    var bundleType = bundle.type.toLowerCase();

    switch (bundleType) {
      case 'js': return 'application/javascript';
      case 'css': return 'text/css';
      case 'fonts':
        if (bundle.files[0].indexOf('.svg') !== -1) return 'image/svg+xml';
        if (bundle.files[0].indexOf('.ttf') !== -1) return 'application/x-font-ttf';
        if (bundle.files[0].indexOf('.woff') !== -1) return 'application/x-font-woff';
        if (bundle.files[0].indexOf('.etc') !== -1) return 'application/vnd.ms-fontobject';
      case 'templates': return 'text/html';
      case 'pages': return 'text/plain';
    }
  },

  getCustomHeaders: function (bundle) {
    var bundleType = bundle.type.toLowerCase(), headers = [];

    headers.push({
      key: 'Content-Type',
      value: controller.getContentType(bundle)
    });

    switch (bundleType) {
      case 'js':
      case 'css':
        // headers.push({ key: 'Content-Encoding', value: 'gzip' });
        // headers.push({ key: 'Accept-Ranges', value: 'bytes' });
        // headers.push({ key: 'Vary', value: 'Accept-Encoding' });
        break;
      case 'fonts':
        headers.push({ key: 'Accept-Ranges', value: 'bytes' });
        break;
    }
    return headers;
  },

  applyHeaders: function (bundle, response) {
    var headers = controller.getCustomHeaders(bundle);
    _.each(headers, function (header) {
      response.setHeader(header.key, header.value);
    });
  },

  serve: function (req, res, next) {
    var bundle = controller.parse(req.url), customHeaders;
    if (!controller.isValidBundle(bundle))
      return next();
    return bundle.compile(function (compiledBundle) {
      controller.applyHeaders(bundle, res);
      res.end(compiledBundle);
    });
  }

};

module.exports = controller;