var _ = require('lodash'),
  Boom = require('boom'),
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
  exports.patchUpdate(server);
};

exports.create = function(server) {
  server.route({
    method: 'POST',
    path: '/users',
    config: {
      validate: {
        payload: {
          name: Joi.string().email().required(),
          password: Joi.string().required(),
          temporary: Joi.boolean()
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

exports.patchUpdate = function(server) {
  server.route({
    method: 'PATCH',
    path: '/users',
    config: {
      auth: {
        strategy: 'token'
      },
      validate: {
        payload: {
          name: Joi.string().email(),
          password: Joi.string(),
          temporary: Joi.boolean(),
          currentPassword: Joi.string().required()
        }
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          user.validatePassword(request.payload.currentPassword, function(isValid) {
            if (isValid) {
              user = _.extend(user, request.payload);

              user.save(function(error, updatedUser) {
                if (error) {
                  reply(Boom.badData('Could not update the user.'));
                } else {
                  reply(updatedUser);
                }
              });
            } else {
              reply(Boom.forbidden('Invalid password or user name.'));
            }
          });
        },
        failure: function(error) {
          reply(Boom.preconditionFailed('The user from the access token could not be found.'));
        }
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
                temporary: user.temporary || false,
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
