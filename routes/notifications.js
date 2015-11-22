var express = require('express');
var Q = require('q');
var https = require('https');

var models = require('../models');
var settings = require('../settings.json');

var router = express.Router();

router.get('/unread', function(req, res, next) {
  models.Notification.findAll({where: {
    seen: false,
    userUsername: req.session.username
  }}).then(function(notifications) {
    res.send(JSON.stringify(notifications));
  }).catch(function(e) {
    res.send(JSON.stringify({success: false, message: e.message, stack: e.stack}));
  });
});

router.get('/list', function(req, res, next) {
  models.Notification.findAll({where: {
    userUsername: req.session.username
  }}).then(function(notifications) {
    res.send(JSON.stringify(notifications));
  }).catch(function(e) {
    res.send(JSON.stringify({success: false, message: e.message, stack: e.stack}));
  });

});

router.get('/read/:notification', function(req, res, next) {
  models.Notification.update({seen: true}, {
    where: {
      id: req.params.notification,
      userUsername: req.session.username
    }
  }).then(function(result) {
    if(result[0] === 0) {
      res.send(JSON.stringify({
        success: false,
        message: "No such notification",
      }));
    } else {
      res.send(JSON.stringify({
        success: true
      }));
    }
  }).catch(function(e) {
    res.send(JSON.stringify({success: false, message: e.message, stack: e.stack}));
  });
});

function sendPushes(deepregistration, title, body, icon, url) {
  var deferred = Q.defer();
  var registrationIds = [];  // GCM registration IDs
  var endpoints = [];

  // deepregistration is an array of arrays of registrations. This flattens them
  deepregistration.forEach(function(registrationList) {
    if(registrationList !== undefined) {
      registrationList.forEach(function(registration) {
        if(registration !== undefined) {
          endpoints.push(registration.endpoint.toString());
        }
      });
    }
  });
  console.log("Sending notifications to endpoints:", endpoints);
  endpoints.forEach(function(endpoint) {
    if(endpoint.indexOf('https://android.googleapis.com/gcm/send') === 0) {
      var endpointParts = endpoint.split('/');
      registrationIds.push(endpointParts[endpointParts.length - 1]);
    } else {
      // log unknown registration type
    }
  });
  if(registrationIds.length > 0) {
    var postdata = JSON.stringify({
      registration_ids: registrationIds
    });
    console.log("Pinging registration ids:", registrationIds);
    var req = https.request({
      hostname: "android.googleapis.com",
      path: '/gcm/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postdata.length,
        'User-Agent': USER_AGENT,
        'Authorization': "key=" + settings.GCM.key
      }
    }, function(res) {
      var raw_gcm_response = "";
      res.on('data', function(chunk) {
        raw_gcm_response += chunk;
      });
      res.on('end', function() {
        try {
          console.log("Got response from GCM:", raw_gcm_response);
          gcm_response = JSON.parse(raw_gcm_response);
          deferred.resolve({
            success: true
          });
        } catch(e) {
          console.log(e.stack || e);
          deferred.reject({
            success: false,
            message: e.message,
            stack: e.stack
          });
        }
      });
    });
    req.on('error', function(e) {
      console.log('[GCM]', 'Error posting message to GCM:', e.message);
    });
    req.write(postdata);
    req.end();
  } else {
    deferred.resolve('No valid registrations');
  }
  return deferred.promise;
}

function getregistrations(tokens) {
  var registrations = [];
  tokens.forEach(function(token) {
    console.log('Getting registartions for:', token.userUsername);
    var registration = models.Registration.findAll({
      where: {userUsername: token.userUsername}
    });
    registrations.push(registration);
  });
  return Q.all(registrations);
}

function checkToken(token) {
  return models.Token.findOne({where: {token: token}}).then(function(token) {
    if(token === null) {
      console.log('Got a bad token!');
      return Q.reject('inalid token');
    } else {
      return models.Notification.create({
        title: title,
        body: body,
        icon: icon,
        url: url,
        tokenToken: token.token,
        userUsername: token.userUsername,
        seen: false
      });
    }
  });
}

router.post('/create', function(req, res, next) {
  if(req.body.tokens && req.body.title) {
    var title = req.body.title;
    var body = req.body.body || "";
    var icon = req.body.icon;
    var url = req.body.url;
    var tokens = [];
    if(typeof(req.body.tokens) == "string") {
      tokens.push(checkToken(req.body.tokens));
    } else {
      req.body.tokens.forEach(function(token) {
        tokens.push(checkToken(token));
      });
    }
    Q.all(tokens).then(getregistrations).then(function(registrations) {
      sendPushes(registrations, title, body, icon, url);
    }).then(function() {
      res.send({success: true});
    }).catch(function(e) {
      res.send({success: false, message: e.message, stack: e.stack});
    });
  } else {
    res.send({
      'error': 'Please provide at least a list of tokens and a title'
    });
  }
});

module.exports = router;
