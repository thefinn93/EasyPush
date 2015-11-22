var https = require('https');
var querystring = require('querystring');

var settings = require('../../settings.json');
var models = require('../../models');

var packagejson = require('../../package.json');
USER_AGENT = "EasyPush v" + packagejson.version + " (+" + packagejson.repository + ")";

function genstate() {
  var out = "";
  while(out.length < 20) {
    out += String.fromCharCode(Math.floor(Math.random() * 93) + 33);
  }
  return out;
}

function get_reddit_token(req, res) {
  var postdata = querystring.stringify({
    grant_type: "authorization_code",
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
      'Content-Length': postdata.length,
      'User-Agent': USER_AGENT
    }
  };
  var token_req = https.request(options, function(token_res) {
    var token_response = "";
    token_res.setEncoding('utf8');
    token_res.on('data', function(chunk) {
      token_response += chunk;
    });
    token_res.on('end', function() {
      var access_token = JSON.parse(token_response).access_token;
      console.log('[reddit_oauth] Access token:', token_response);
      req.session.reddit_token = access_token;
      var ident_req = https.request({
        hostname: 'oauth.reddit.com',
        headers: {'Authorization': "bearer " + access_token, 'User-Agent': USER_AGENT},
        method: 'GET',
        path: '/api/v1/me'
      }, function(ident_res) {
        console.log('[reddit_oauth]', 'Requesting /api/v1/me with access_token', access_token);
        var ident = "";
        ident_res.on('data', function(chunk) {
          ident += chunk;
        });
        ident_res.on('end', function() {
          console.log('[reddit_oauth] Ident response:', ident.toString());
          var ident_parsed = JSON.parse(ident);
          req.session.reddit_username = ident_parsed.name;
          req.session.username = '/u/' + ident_parsed.name;
          models.User.upsert({
            username: '/u/' + ident_parsed.name,
            reddit_username: ident_parsed.name,
            reddit_token: access_token
          }).then(function() {
            res.redirect('/');
          });
        });
      });
      ident_req.on('error', function(e) {
        console.log('[reddit_oauth]', 'Error requesting identity info:', e.message);
        throw e;
      });
      ident_req.end();
    });
  });

  token_req.on('error', function(e) {
    console.log('[reddit_oauth]', 'Error requesting identity info:', e.message);
    throw e;
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
    if(req.query.state == req.session.reddit_state) {
      get_reddit_token(req, res);
    } else {
      req.session.login_error = "Bad state";
      res.redirect(settings.baseURI + '/auth');
    }
  }
};
