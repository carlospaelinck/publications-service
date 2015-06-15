var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema,
  Shape = require('./shape').Shape;

var Document = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  name: {type: String, required: true, trim: true, unique: false},
  width: {type: Number, required: true},
  height: {type: Number, required: true},
  modified: {type: Date, default: Date.now},
  shapes: [Shape.schema]
});

module.exports = {
  Document: Mongoose.model('Document', Document)
};
