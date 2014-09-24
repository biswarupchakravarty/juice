var express = require('express');
var router = express.Router();
var knox = require('knox');

var client = knox.createClient({
  key: 'AKIAJ5FMVJ3FHNCC357Q',
  secret: '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',
  bucket: 'static.shiny.co.in'
});



/* GET home page. */
router.get('/', function(req, res) {
  client.list({ prefix: '' }, function (err, data) {
    res.render('admin/admin', {
      title: 'Admin Panel',
      user: {
        name: 'Biswarup Chakravarty'
      },
      details: JSON.stringify(data, null, 2)
    });
    /* `data` will look roughly like:

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
});
});

module.exports = router;
