var mongoose = require('mongoose');
var juicedImageSchema = require('./schemas/juicedImage');

module.exports = mongoose.model('JuicedImage', juicedImageSchema);