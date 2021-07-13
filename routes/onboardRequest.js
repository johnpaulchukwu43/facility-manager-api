import {clientAppUrl} from "../config/secret";

var managerToClientOnboardRequestDao = require('../dao/managerToClientOnboardRequestDao');
const tokenChecker = require("../common/util").tokenChecker;
const generateRef = require("../common/util").genRef;
const constants = require("../common/constants");




module.exports = function (router) {

  //API to get a particular provider
  router.post('/manager/onboard', tokenChecker, function (req, res) {

    //todo validate userType as valid and existent
    //todo ensure email is unique

    let notificationUrl = `${clientAppUrl}user/sign-up`;


    var request = {
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      recipientEmail: req.body.recipientEmail,
      recipientName: req.body.firstName+''+req.body.lastName,
      userType: req.body.userType,
      notificationUrl: notificationUrl,
      facilityManagerId: req.decoded.userId,
      facilityManagerName: req.decoded.name,
      reference: generateRef(),
      isEmailSent: false,
      isAccountCreated: false
    };

    return managerToClientOnboardRequestDao.createRequest(request,res);
  });

  router.get('/manager/onboard/:ref', async (req,res) => {
    let reference = req.params.ref;

    let {status,data,message} = await managerToClientOnboardRequestDao.findByRef(reference);

    if(status !== constants.SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});


    res.status(200).json({status, message: 'Fetched onboard request success', data});


  });


  return router;

};
