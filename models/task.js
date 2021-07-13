const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');


var customSchema = Object.assign({}, {
  name: {type: String, required: true,  unique: true},
  description: {type: String},
  status: {type: String, required: true},
  facilityManagerId: {type: Schema.Types.ObjectId, required: true},
  maintainablesType: {type: String, required: true},
  maintainablesId: {type: Schema.Types.ObjectId, required: true},
  taskType: {type: String, required: true},
  taskFrequency: {type: String},
  taskRequestedBy: {type: String, required: true},
  occupantId: {type: Schema.Types.ObjectId},
  artisanId: {type: Schema.Types.ObjectId},
  occupantImageUploadUrl: {type: String},
  artisanImageUploadUrl: {type: String},
  taskReference: {type: String, required:true}
}, auditSchema);

const Task = new Schema(customSchema);

module.exports = mongoose.model('Task', Task);
