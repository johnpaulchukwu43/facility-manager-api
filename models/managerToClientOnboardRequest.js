const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const auditSchema = require('./auditable');
const emailValidate = require('../common/util').emailValidate;


var customSchema = Object.assign({}, {
  recipientName: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userType: {type: String, required: true},
  reference: {type: String, required: true, unique: true},
  recipientEmail: {type: String, unique: true, validate: emailValidate},
  isEmailSent: {type: Boolean, default: false},
  facilityManagerId: { type: Schema.Types.ObjectId, required: true },
  isAccountCreated: {type: Boolean, default: false},
  notificationUrl: {type: String, required: true}

}, auditSchema);

const ManagerToClientOnboardRequest = new Schema(customSchema);

module.exports = mongoose.model('ManagerToClientOnboardRequest', ManagerToClientOnboardRequest);
