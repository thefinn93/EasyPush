var https = require('https');
var querystring = require('querystring');

var settings = require('../../settings.json');
var models = require('../../models');


function genstate() {
  var out = "";
  while(out.length < 20) {
    out += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
  }
  return out;
}

function get_reddit_token(req, res) {
  var postdata = querystring.stringify({
    grant_type: "authorization_basic",
    code: req.query.code,
    redirect_uri: settings.baseURI + "/oauth/reddit_callback"
  });

  var options = {
    hostname: "ssl.reddit.com",
    auth: settings.reddit.id + ":" + settings.reddit.secret,
    path: '/api/v1/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postdata.length
    }
  };
  var token_req = https.request(options, function(token_res) {
    var token_response = "";
    token_res.setEncoding('utf8');
    token_res.on('data', function(chunk) {
      console.log('[reddit_oauth] Got a chunk back from the token request:', chunk.toString());
      token_response += chunk;
    });
    token_res.on('end', function() {
      var access_token = JSON.parse(token_response).access_token;
      console.log('[reddit_oauth] Access token:', token_response);
      req.session.reddit_token = access_token;
      https.request({
        hostname: 'oauth.reddit.com',
        headers: {'Authorization': "bearer" + access_token},
        method: 'GET',
        path: '/api/v1/me'
      }, function(ident_res) {
        var ident = "";
        ident_res.on('data', function(chunk) {
          ident += chunk;
        });
        ident_res.on('end', function() {
          var ident_parsed = JSON.parse(chunk);
          req.session.reddit_username = ident_parsed.name;
          req.session.username = '/u/' + req.session.reddit_username;
          models.User.upsert({
            username: req.session.username,
            reddit_username: reddit_username,
            reddit_token: access_token
          }).then(function() {
            res.redirect('/');
          });
        });
      });
    });
  });

  token_req.on('error', function(e) {
    console.log('[reddit_oauth] problem with request: ' + e.message);
  });

  token_req.write(postdata);
  token_req.end();
}

exports.preauth = function (req, res, next) {
  var state = genstate();
  req.session.reddit_state = state;
  var authorize_query = querystring.stringify({
    client_id: settings.reddit.id,
    response_type: "code",
    state: state,
    redirect_uri: settings.baseURI + "/oauth/reddit_callback",
    duration: "temporary",
    scope: "identity"
  });
  res.redirect("https://www.reddit.com/api/v1/authorize?" + authorize_query);
};

exports.postauth = function(req, res, next) {
  if(req.query.error) {
    req.session.login_error = req.query.error;
    res.redirect(settings.baseURI + '/auth');
  } else if (req.query.state && req.query.code) {
    console.log('[reddit_oauth] state and code received!');
    if(req.query.state == req.session.reddit_state) {
      console.log('[reddit_oauth] state is valid!');
      get_reddit_token(req, res);
    } else {
      req.session.login_error = "Bad state";
      res.redirect(settings.baseURI + '/auth');
    }
  }
};
