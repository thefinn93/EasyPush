var express = require('express');
var https = require('https');
var querystring = require('querystring');

var settings = require('../settings.json');
var models = require('../models');

var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login', user: req.session.username });
});


module.exports = router;
