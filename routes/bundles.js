var express = require('express');

var controller = require('../controllers/staticResources.js');

var router = express.Router();

router.get('*', controller.serve);

module.exports = router;
