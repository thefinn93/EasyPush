var Sequelize = require('sequelize');
var settings = require('./settings.json');
var sequelize = new Sequelize(settings.db);

var User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  reddit_username: {
    type: Sequelize.STRING,
  },
  reddit_token: {
    type: Sequelize.STRING
  }
});

var Registration = sequelize.define('registration', {
  registration_id: {
    type: Sequelize.STRING
  },
  user: {
    type: User,
  },
  enabled: {
    type: Sequelize.BOOLEAN
  }
});

exports.User = User;
exports.Registration = Registration;
exports.db = sequelize;
