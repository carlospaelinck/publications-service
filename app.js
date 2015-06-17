var Config = require('./service/config'),
  Hapi = require('hapi'),
  Moment = require('moment'),
  Mongoose = require('mongoose'),
  Path = require('path');

var server = new Hapi.Server({
  connections: {
    routes: {
      cors: true
    }
  }
});

var routes = require('./service/routes');

server.connection({port: 3300});
Mongoose.connect('mongodb://localhost/pub-ng');

var validate = function(token, callback) {
  var diff = Moment().diff(Moment(token.iat * 1000));
  if (diff > Config.key.tokenExpiry) {
    return callback(null, false);
  } else {
    callback(null, true, token);
  }
};

server.start(function() {
  console.log('Server running at: ' + server.info.uri);
});

server.register(require('hapi-auth-jwt'), function(error) {
  if (error) { console.log(error); }

  server.auth.strategy('token', 'jwt', {
    key: Config.key.privateKey,
    validateFunc: validate
  });

  routes.init(server);

  server.route([
    {method: 'GET', path: '/', handler: function(request, reply) { reply('Publications Web Service'); }}
  ]);

});
