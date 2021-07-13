const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');


var customSchema = Object.assign({}, {
  name: {type: String, required: true,  unique: true},
  description: {type: String},
  status: {type: String, required: true},
  roomId: {type: Schema.Types.ObjectId, required: true},
  assetCategory: {type: String, required: true},
  identificationNumber: {type: String, required: true, unique: true}

}, auditSchema);

const Asset = new Schema(customSchema);

module.exports = mongoose.model('Asset', Asset);
