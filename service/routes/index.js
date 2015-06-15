exports.init = function(server) {
  require('./user')(server);
  require('./document')(server);
};
