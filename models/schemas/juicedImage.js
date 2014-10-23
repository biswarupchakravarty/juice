var mongoose = require('mongoose');

module.exports = {

  path: String,

  name: String,

  extension: String,

  hostedURL: String,

  annotations: [],

  dimensions: {
    height: Number,
    width: Number
  },

  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser'}

}