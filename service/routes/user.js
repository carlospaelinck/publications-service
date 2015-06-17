var Boom = require('boom'),
  Bcrypt = require('bcryptjs'),
  Config = require('../config'),
  Joi = require('joi'),
  Jwt = require('jsonwebtoken'),
  User = require('../models/user').User,
  Shared = require('../shared');

module.exports = exports = function(server) {
  exports.create(server);
  exports.login(server);
  exports.show(server);
};

exports.create = function(server) {
  server.route({
    method: 'POST',
    path: '/users',
    config: {
      validate: {
        payload: {
          name: Joi.string().email().required(),
          password: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      var user = new User({
        name: request.payload.name,
        password: request.payload.password,
        temporary: request.payload.temporary || false,
      });

      user.save(function(error, user) {
        reply(user || error);
      });
    }
  });
};

exports.login = function(server) {
  server.route({
    method: 'POST',
    path: '/login',
    config: {
      validate: {
        payload: {
          name: Joi.string().email().required(),
          password: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      User.findUser(request.payload.name, function(error, user) {
        if (!error && user) {
          user.validatePassword(request.payload.password, function(isValid) {
            if (isValid) {
              var tokenData = {
                name: user.name,
                id: user._id
              };

              var response = {
                name: user.name,
                id: user._id,
                token: Jwt.sign(tokenData, Config.key.privateKey)
              };

              reply(response);

            } else {
              reply(Boom.forbidden('Invalid password or user name.'));
            }
          });

        } else {
          reply(Boom.forbidden('Invalid password or user name.'));
        }
      });
    }
  });
};

exports.show = function(server) {
  server.route({
    method: 'GET',
    path: '/users/current',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          reply(user);
        },
        failure: function(error) {
          reply(Boom.preconditionFailed('The user from the access token could not be found.'));
        }
      });
    }
  });
};
