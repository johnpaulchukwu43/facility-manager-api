const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');


var customSchema = Object.assign({}, {
  name: {type: String, required: true,  unique: true},
  description: {type: String},
  status: {type: String, required: true},
  facilityManagerId: {type: Schema.Types.ObjectId, required: true}

}, auditSchema);

const Building = new Schema(customSchema);

module.exports = mongoose.model('Building', Building);
