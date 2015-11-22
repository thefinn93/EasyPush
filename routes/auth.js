var express = require('express');
var querystring = require('querystring');

var settings = require('../settings.json');
var models = require('../models');

var router = express.Router();


router.get('/', function(req, res, next) {
  res.redirect('/oauth/reddit');
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(e) {
    if(e) {
      throw e;
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
