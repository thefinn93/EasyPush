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
    type: Sequelize.STRING,
    primaryKey: true
  }
});

Registration.belongsTo(User);

var Token = sequelize.define('authorization', {
  token: {
    type: Sequelize.STRING
  },
  // A human-friendly name for this provider
  name: {
    type: Sequelize.STRING
  }
});

Token.belongsTo(User);

User.sync();
Registration.sync();
Token.sync();

exports.User = User;
exports.Registration = Registration;
exports.Token = Token;
exports.db = sequelize;
