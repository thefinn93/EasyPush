var express = require('express');
var models = require('../models');

var router = express.Router();

function gentoken() {
  var out = "";
  while(out.length < 20) {
    out += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
  }
  return out;
}

router.get('/list', function(req, res, next) {
  models.Token.findAll({
    where: { userUsername: req.session.username }
  }).then(function(tokens) {
    res.setHeader('Content-Type', 'application/json');
    res.send(tokens);
  }).catch(function(e) {
    res.render('error', {
      message: e.message,
      error: e
    });
  });
});

router.get('/new', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  if(req.query.name) {
    models.Token.findOne({
      where: {
        userUsername: req.session.username,
        name: req.query.name
      }
    }).then(function(existing) {
      if(existing === null) {
        var token = gentoken();
        models.Token.create({
          userUsername: req.session.username,
          name: req.query.name,
          token: token
        }).then(function(newtoken) {
          res.send(JSON.stringify(newtoken));
        });
      } else {
        // Maybe we should reconsider showing the token to the client more than on creation
        res.send(JSON.stringify(existing));
      }
    }).catch(function(e) {
      res.send(JSON.stringify({
        'error': e.message,
        'stack': e.stack
      }));
    });
  } else {
    res.send(JSON.stringify({
      'error': 'Please specify a name for the token'
    }));
  }
});


module.exports = router;
