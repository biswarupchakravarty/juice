var mongoose = require('mongoose');

module.exports = {

  path: String,

  name: String,

  annotations: [],

  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser'}

}