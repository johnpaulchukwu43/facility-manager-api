/*
 Created by Johnpaul Chukwu @ $
*/

const EmailNotification = require('../models/emailNotification');

const secret = require('../config/secret');
const constants = require( "../common/constants");
const util = require( "../common/util");
import EventEmitter from "../events";

export const createUserOnboardedNotification = async (req, res) => {
  //get base request and requests unique to this product category
  const request = {
    recipient: req.recipient,
    sender: secret.emailSender,
    senderAddress: secret.emailSenderAddress,
    subject: constants.FACILITY_MANAGER_ONBOARDED_TITLE,
    message: constants.getFacilityManagerOnboardedMessage(req.name),
    notificationStatus: constants.NOTIFICATION_STATUS.PENDING,
    reference:util.genRef(),
    notificationType: constants.NOTIFICATION_TYPES.MANAGER_ONBOARDED,
    isBeenSent: false,
    firstName: req.firstName,
    lastName:req.lastName
  };

  //save Request to Db

  let {status,data, message} = await saveRequestToDb(request);

  if (status !== constants.SYSTEM_STATUS.SUCCESS) {
    return res.status(500).json({status,message});
  }

  EventEmitter.broadcastOnboardedAction(data._doc);

};


export const createManagerToClientOnboardNotification = async (req, res) => {
  //get base request and requests unique to this product category
  const request = {
    recipient: req.recipientEmail,
    sender: secret.emailSender,
    senderAddress: secret.emailSenderAddress,
    subject: constants.FACILITY_MANAGER_TO_CLIENT_ONBOARD_REQUEST_TITLE,
    message: constants.getFacilityManagerToClientOnboardRequestMessage(req.recipientName, req.facilityManagerName, req.notificationUrl,req.userType, req.reference),
    notificationStatus: constants.NOTIFICATION_STATUS.PENDING,
    reference:util.genRef(),
    notificationType: constants.NOTIFICATION_TYPES.MANAGER_TO_CLIENT_ONBOARD_REQUEST,
    isBeenSent: false,
    firstName: req.firstName,
    lastName:req.lastName
  };


  //save Request to Db
  let {status,data, message} = await saveRequestToDb(request);

  if (status !== constants.SYSTEM_STATUS.SUCCESS) {
    return res.status(500).json({status,message});
  }

  EventEmitter.broadcastManagerToClientOnboardRequestAction(data._doc);
};



export const createTaskStatusChangeNotification = async (req, res) => {
  //get base request and requests unique to this product category

  let {notificationType,name,taskName, userType, oldStatus, newStatus, extraDetails, recipientEmail,taskReference,firstName,lastName} = req;


  const request = {
    recipient: recipientEmail,
    sender: secret.emailSender,
    senderAddress: secret.emailSenderAddress,
    subject: constants.TASK_NOTIFICATION_TITLE,
    message: constants.getTaskStatusChangeNotificationMessgae(name,taskName, userType, oldStatus, newStatus, taskReference,extraDetails),
    notificationStatus: constants.NOTIFICATION_STATUS.PENDING,
    reference:util.genRef(),
    notificationType: notificationType,
    isBeenSent: false,
    firstName,
    lastName
  };


  //save Request to Db
  let {status,data, message} = await saveRequestToDb(request);

  if (status !== constants.SYSTEM_STATUS.SUCCESS) {
    return res.status(500).json({status,message});
  }

  EventEmitter.broadcastTaskNotificationRequest(data);

};

export const findByIdAndUpdate = async (updatedDetails, id) => {

  try{

    let data = await EmailNotification.findByIdAndUpdate(id,updatedDetails);

    if (data === null) return {message: "No record to update", status: constants.SYSTEM_STATUS.FAILED};

    return {status: constants.SYSTEM_STATUS.SUCCESS, data};
  }catch (e) {
    console.log(JSON.stringify(e));
    return {message: "Error updating record", status: constants.SYSTEM_STATUS.ERROR};
  }

};


const saveRequestToDb = async (request) => {
  let productModel = new EmailNotification(request);

  try{
    let data = await productModel.save();
    return {status: constants.SYSTEM_STATUS.SUCCESS, data};
  }catch (e) {
    console.log(JSON.stringify(e));
    return {message: "Error saving record", status: constants.SYSTEM_STATUS.ERROR};
  }
};




