var Bundle = require('../lib/bundle');
var BUNDLES = require('../lib/bundles/main.js');
var SUPPORTED_BUNDLE_TYPES = ['css', 'js'];

var controller = {

  isValidBundle: function (bundle) {
    if (!bundle) return false;
    return (typeof bundle.files !== "undefined");
  },

  parse: function (url) {
    var tokens = url.split('/').filter(function (token) {
      return token.trim().length > 0;
    });
    if (!BUNDLES[tokens[0]] || !BUNDLES[tokens[0]][tokens[1]]) return false;
    return new Bundle({
      type: tokens[0],
      name: tokens[1],
      files: BUNDLES[tokens[0]][tokens[1]]
    });
  },

  getContentType: function (bundle) {
    var bundleType = bundle.type.toLowerCase(),
      extension;

    switch (bundleType) {
      case 'js': return 'application/javascript';
      case 'css': return 'text/css';
      case 'fonts':
        if (bundle.files[0].indexOf('.svg') !== -1) return 'image/svg+xml';
        if (bundle.files[0].indexOf('.ttf') !== -1) return 'application/x-font-ttf';
        if (bundle.files[0].indexOf('.woff') !== -1) return 'application/x-font-woff';
        if (bundle.files[0].indexOf('.woff') !== -1) return 'application/vnd.ms-fontobject';
    }
  },

  serve: function (req, res, next) {
    var bundle = controller.parse(req.url);
    if (!controller.isValidBundle(bundle))
      return next();
    return bundle.compile(function (compiledBundle) {
      res.setHeader('Content-Type', controller.getContentType(bundle));
      res.end(compiledBundle);
    });
  }

};

module.exports = controller;