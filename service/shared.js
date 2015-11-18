var Config = require('./config'),
  Jwt = require('jsonwebtoken'),
  User = require('./models/user').User;

module.exports = {
  userFromToken: function(options) {
    Jwt.verify(
    options.request.headers.authorization.split(' ')[1],
    Config.key.privateKey,
    {algorithms: ['HS256']},
    function(error, decoded) {
      User.findById(decoded.id, function(error, user) {
        if (error || !user) {
          options.failure(error);
        } else {
          options.success(user);
        }
      });
    });
  }
};
