var Bcrypt = require('bcryptjs'),
  Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;

var User = new Schema({
  name: {type: String, required: true, trim: true, unique: true},
  password: {type: String, required: true},
  documents: [{type: Schema.Types.ObjectId, ref: 'Document'}]
});

User.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();

  Bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    Bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

User.statics.findUser = function(name, callback) {
  this.findOne({name: name}, callback);
};

User.methods = {
  validatePassword: function(password, callback) {
    Bcrypt.compare(password, this.password, function(error, isValid) {
      if (error) return callback(false);
      else return callback(isValid);
    });
  },

  toJSON: function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
  },
};

module.exports = {
  User: Mongoose.model('User', User)
};
