/*
 Created by Johnpaul Chukwu @ $
*/

import {SYSTEM_STATUS} from "../common/constants";

const ManagerToClientOnboardRequest = require('../models/managerToClientOnboardRequest');
const emailNotificationDao = require('../dao/emailNotificationDao');

const secret = require('../config/secret');
const constants = require("../common/constants");
const util = require("../common/util");

const createRequest = async (req, res) => {
  const request = {
    firstName:req.firstName,
    lastName:req.lastName,
    recipientEmail: req.recipientEmail,
    recipientName: req.recipientName,
    userType: req.userType,
    notificationUrl: req.notificationUrl,
    facilityManagerId: req.facilityManagerId,
    facilityManagerName: req.facilityManagerName,
    reference: req.reference,
    isEmailSent: false,
    isAccountCreated: false
  };

  //save Request to Db
  let {status,data,message} = await saveRequestToDb(request, res);

  if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,message});
  if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});

  await emailNotificationDao.createManagerToClientOnboardNotification(request, res);

  return res.status(200).json({status, message: 'Successfully created onboard request',data});

};

const updateRequest = async(id,updateBody) =>{

  let matchQuery = {"_id":id};

  try {
    let data = await ManagerToClientOnboardRequest.findOneAndUpdate(matchQuery,updateBody,{ returnNewDocument: true });

    if (data === null) return {message: "No record found for update", status: SYSTEM_STATUS.FAILED};

    return {status: SYSTEM_STATUS.SUCCESS, data};
  } catch (e) {
    console.log(e);
    return {message: "Error updating record", status: SYSTEM_STATUS.ERROR};
  }

};



const findByRef = async (reference) => {
  try{
    let data = await ManagerToClientOnboardRequest.findOne({reference: reference});

    if (data === null) return {message: "No record found", status: constants.SYSTEM_STATUS.FAILED};

    return {status: constants.SYSTEM_STATUS.SUCCESS, data};
  }catch (e) {
    console.log(JSON.stringify(e));
    return {message: "Error getting record", status: constants.SYSTEM_STATUS.ERROR};
  }

};

const saveRequestToDb = async (request, res) => {
  let productModel = new ManagerToClientOnboardRequest(request);

  try{
    let data = await productModel.save();
    return {status: constants.SYSTEM_STATUS.SUCCESS, data};
  }catch (e) {
    console.log(JSON.stringify(e));

    if(e.code === 11000) return {message: "Email already exists", status: constants.SYSTEM_STATUS.FAILED};

    return {message: "Error saving record", status: constants.SYSTEM_STATUS.ERROR};
  }
};


module.exports = {
  createRequest,
  findByRef,
  updateRequest
};
