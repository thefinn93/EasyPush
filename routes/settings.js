var express = require('express');
var models = require('../models');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('settings', {'title': 'Settings', user: req.session.username});
});

router.post('/subscribe', function(req, res, next) {
  if(req.body.endpoint) {
    models.Registration.upsert({
      registration_id: req.body.endpoint,
      UserId: req.session.username
    }).then(function() {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        "subscribed": true
      }));
    }).catch(function(e) {
      res.render('error', {
        message: e.message,
        error: e
      });
    });
  }
});

module.exports = router;
