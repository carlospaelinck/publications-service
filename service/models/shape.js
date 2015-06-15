var Mongoose = require('mongoose'),
  Schema = Mongoose.Schema;

var Shape = new Schema({
  type: {type: String, required: true},
  width: {type: Number},
  height: {type: Number},
  x: {type: Number},
  y: {type: Number},
  r: {type: Number},
  angle: {type: Number},
  fill: {type: String},
  color: {type: String},
  stroke: {type: String},
  strokeWidth: {type: Number},
  fillOpacity: {type: Number},
  opacity: {type: Number },
  strokeOpacity: {type: Number},
  text: {type: String },
  fontSize: {type: Number},
  fontFamily: {type: String},
  fontWeight: {type: Number},
  fontStyle: {type: String},
  textAlign: {type: String}
});

module.exports = {
  Shape: Mongoose.model('Shape', Shape)
};
