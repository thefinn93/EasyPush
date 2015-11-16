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
      userUsername: req.session.username
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

router.get('/subscriptions', function(req, res, next) {
  models.Registration.findAll({
    where: { userUsername: req.session.username }
  }).then(function(registrations) {
    res.send(registrations);
  }).catch(function(e) {
    res.render('error', {
      message: e.message,
      error: e
    });
  });
});

module.exports = router;
