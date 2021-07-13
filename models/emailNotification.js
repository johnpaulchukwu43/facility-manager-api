const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');


var customSchema = Object.assign({}, {
  recipient: {type: String, required: true},
  sender: {type: String, required: true},
  senderAddress: {type: String, required: true},
  subject: {type: String, required: true},
  message: {type: String, required: true},
  notificationStatus: {type: String},
  notificationType: {type: String, required: true},
  reference: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  taskId: {type: Schema.Types.ObjectId},
  isBeenSent: {
    type: Boolean,
    default: false
  },


}, auditSchema);
const EmailNotification = new Schema(customSchema);
module.exports = mongoose.model('EmailNotification', EmailNotification);
