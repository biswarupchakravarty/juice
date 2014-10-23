var _extend = function (bundle, extra) {
  return Array.prototype.slice.call(bundle).concat(extra);
};

var bundles = {
  js: [],
  css: [],
  fonts: []
};

// ------------------------------ JS ------------------------------------

bundles.js['common.js'] = [
  '/javascripts/lib/jquery.min.js',
  '/javascripts/lib/bootstrap.min.js',
  '/javascripts/lib/underscore.min.js'
];


bundles.js['admin.js'] = _extend(bundles.js['common.js'], [
  '/javascripts/lib/nprogress.js'
]);

bundles.js['newFile.js'] = [
  '/javascripts/newFile.js'
];

bundles.js['show.js'] = [
  '/javascripts/lib/codemirror.min.js',
  
  '/javascripts/admin/show.js',
  '/javascripts/admin/juicedImageModel.js',
  '/javascripts/admin/juicedImageView.js',
  '/javascripts/admin/annotationView.js',
  '/javascripts/annotations/annotationModel.js'
]



// ------------------------------ CSS ------------------------------------

bundles.css['common.css'] = [
  '/stylesheets/lib/bootstrap.min.css',
  '/stylesheets/style.css'
]

bundles.css['admin.css'] = _extend(bundles.css['common.css'], [
  '/stylesheets/admin.css',
  '/stylesheets/nprogress.css'
]);

bundles.css['editFile.css'] = [
  '/stylesheets/lib/codemirror.css',
  '/stylesheets/admin/edit_file.css'
];

// --------------------------- FONTS --------------------------------------

bundles.fonts['glyphicons-halflings-regular.eot'] = ['/fonts/glyphicons-halflings-regular.eot']
bundles.fonts['glyphicons-halflings-regular.svg'] = ['/fonts/glyphicons-halflings-regular.svg']
bundles.fonts['glyphicons-halflings-regular.ttf'] = ['/fonts/glyphicons-halflings-regular.ttf']
bundles.fonts['glyphicons-halflings-regular.woff'] = ['/fonts/glyphicons-halflings-regular.woff']



module.exports = bundles;