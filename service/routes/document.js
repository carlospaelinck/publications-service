var _ = require('lodash'),
  Boom = require('boom'),
  Bcrypt = require('bcryptjs'),
  Config = require('../config'),
  Document = require('../models/document').Document,
  Joi = require('joi'),
  Jwt = require('jsonwebtoken'),
  Shape = require('../models/shape').Shape,
  Shared = require('../shared'),
  User = require('../models/user').User;

module.exports = exports = function(server) {
  exports.create(server);
  exports.show(server);
  exports.index(server);
  exports.delete(server);
  exports.update(server);
};

exports.index = function(server) {
  server.route({
    method: 'GET',
    path: '/documents',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          Document.find({
            _user: user._id
          },
          function(error, documents) {
            if (error || !documents) {
              reply(Boom.notFound('The user\'s documents cound not be listed.'));
            } else {
              reply(documents);
            }
          });
        },
        failure: function(error) {
          reply(Boom.preconditionFailed('The user from the access token could not be found.'));
        }
      });
    }
  });
}

exports.show = function(server) {
  server.route({
    method: 'GET',
    path: '/documents/{id}',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          Document.findOne({
            _user: user._id,
            _id: request.params.id
          },
          function(error, foundDocument) {
            if (error || !foundDocument) {
              reply(Boom.notFound('The document cound not be found.'));
            } else {
              reply(foundDocument);
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

exports.update = function(server) {
  server.route({
    method: 'PUT',
    path: '/documents/{id}',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          Document.findOne({
            _user: user._id,
            _id: request.params.id
          },
          function(error, foundDocument) {
            if (error || !foundDocument) {
              reply(Boom.notFound('The document cound not be found.'));
            } else {
              foundDocument = _.extend(foundDocument, request.payload);
              foundDocument.save(function(error, updatedDocument) {
                if (error) {
                  reply(Boom.badData('Could not update the document.'));
                } else {
                  reply(updatedDocument);
                }
              });
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

exports.create = function(server) {
  server.route({
    method: 'POST',
    path: '/documents',
    config: {
      validate: {
        payload: {
          name: Joi.string().required(),
          width: Joi.number().required(),
          height: Joi.number().required()
        }
      },
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          request.payload['_user'] = user._id;
          var newDocument = new Document(request.payload);
          user.documents.push(newDocument);
          user.save(function(error) {
            if (error) {
              reply(Boom.badData('Could not update the user with the document.'));
            } else {
              newDocument.save(function(error, savedDocument) {
                if (error) {
                  reply(Boom.badData('Could not save the document.'));
                } else {
                  reply(savedDocument);
                }
              });
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

exports.delete = function(server) {
  server.route({
    method: 'DELETE',
    path: '/documents/{id}',
    config: {
      auth: {
        strategy: 'token'
      }
    },
    handler: function(request, reply) {
      Shared.userFromToken({
        request: request,
        success: function(user) {
          Document.findOne({
            _user: user._id,
            _id: request.params.id
          },
          function(error, foundDocument) {
            if (error || !foundDocument) {
              reply(Boom.notFound('The document cound not be found.'));
            } else {
              user.documents.remove(foundDocument);
              user.save(function(error) {
                if (error) {
                  reply(Boom.preconditionFailed('The user with the deleted document could not be updated.'));
                } else {
                  foundDocument.remove(function() {
                    reply({success: true});
                  });
                }
              });
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
