/*
EasyPush
Copyright (C) 2015  Finn Herzfeld

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var raven = require('raven');

var settings = require('./settings.json');
var models = require('./models.js');

var routes = require('./routes/index');
var settingsroute = require('./routes/settings');
var auth = require('./routes/auth');
var oauth = require('./routes/oauth/index');
var notifications = require('./routes/notifications');
var token = require('./routes/token');

var app = express();
app.use(raven.middleware.express.requestHandler(settings.sentryDSN));
app.use(raven.middleware.express.errorHandler(settings.sentryDSN));

app.db = models.db;
var sessionStorage = new SequelizeStore({db: models.db});
app.use(session({
  secret: settings.secret,
  store: sessionStorage,
  proxy: settings.proxy,
  cookie: {
    secure: settings.secureCookie,
    maxAge: new Date(Date.now() + 3600000 * 24 * 365 * 10)
  }
}));
sessionStorage.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/auth', auth);
app.use('/oauth', oauth);
app.use('/settings', settingsroute);
app.use('/notifications', notifications);
app.use('/token', token);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.end('error', res.sentry);
});


module.exports = app;
