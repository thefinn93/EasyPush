var express = require('express');
var https = require('https');
var querystring = require('querystring');

var settings = require('../settings.json');
var models = require('../models');

var router = express.Router();


router.get('/', function(req, res, next) {
  res.redirect('/oauth/reddit');
  // res.render('login', { title: 'Login', user: req.session.username });
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(e) {
    if(e) {
      res.render('error', {
        message: e.message,
        error: e
      });
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
