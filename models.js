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
  endpoint: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

Registration.belongsTo(User);

var Token = sequelize.define('token', {
  token: {
    type: Sequelize.STRING
  },
  // A human-friendly name for this provider
  name: {
    type: Sequelize.STRING
  }
});

Token.belongsTo(User);

var Notification = sequelize.define('notification', {
  title: {
    type: Sequelize.STRING
  },
  body: {
    type: Sequelize.STRING
  },
  url: {
    type: Sequelize.STRING
  },
  icon: {
    type: Sequelize.STRING
  },
  seen: {
    type: Sequelize.BOOLEAN
  }
});

Notification.belongsTo(Token);
Notification.belongsTo(User);

User.sync();
Token.sync();
Registration.sync();
Notification.sync();

exports.User = User;
exports.Token = Token;
exports.Registration = Registration;
exports.Notification = Notification;
exports.db = sequelize;
