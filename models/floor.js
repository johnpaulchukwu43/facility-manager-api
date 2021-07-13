const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');


var customSchema = Object.assign({}, {
  name: {type: String, required: true},
  description: {type: String},
  status: {type: String, required: true},
  buildingId: {type: Schema.Types.ObjectId, required: true}

}, auditSchema);

const Floor = new Schema(customSchema);

module.exports = mongoose.model('Floor', Floor);
