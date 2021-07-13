import {getRoleByUserType} from "../common/roles";
import {SYSTEM_STATUS} from "../common/constants";
import _ from "lodash";
import UserDao from "../dao/userDao";
const User = require('../models/user');
const config = require('../config/secret');
let {updateRequest} = require('../dao/managerToClientOnboardRequestDao');
let emailNotificationDao = require('../dao/emailNotificationDao');
const ObjectId = require('../models/baseMongoose').Types.ObjectId;


let validQueryParameters = require('../common/validation').validQueryParameters;

const jwt = require('jsonwebtoken');
const constant = require('../common/constants');
const tokenChecker = require("../common/util").tokenChecker;


module.exports = function (router) {

  // register api
  router.post('/user/signup', async function (req, res) {

    console.log(JSON.stringify(req.body));

    if (!req.body.email) {
      res.status(400).json({success: false, message: 'Email is required'});
    } else {
      if (!req.body.password) {
        res.status(400).json({success: false, message: 'Password is required'});
      } else {
        if (!req.body.firstName) {
          res.status(400).json({success: false, message: 'First name is required'});
        } else {
          if (!req.body.lastName) {
            res.status(400).json({success: false, message: 'Last name is required'});
          } else {
            //todo validate onbardedBy,
            var user = new User({
              email: req.body.email,
              password: req.body.password,
              firstname: req.body.firstName,
              lastname: req.body.lastName,
              userType: req.body.userType,
              isVerificationEmailSent: false,
              onBoardedBy: req.body.onBoardedBy,
              status: req.body.status,
              address: req.body.address,
              phoneNumber: req.body.phoneNumber,
              company: req.body.company
            });
            user.save(async function (err) {
              if (err) {
                if (err.code === 11000) {
                  res.status(400).json({success: false, message: 'E-mail already exists'});
                } else {
                  if (err.errors) {
                    if (err.errors.email) {
                      res.status(400).json({success: false, message: err.errors.email.message});
                    } else {
                      if (err.errors.phoneNumber) {
                        res.status(400).json({
                          success: false,
                          message: err.errors.phoneNumber.message
                        });
                      } else {
                        if (err.errors.password) {
                          res.status(400).json({
                            success: false,
                            message: err.errors.password.message
                          });
                        } else {
                          res.status(400).json({success: false, message: err});
                        }
                      }
                    }
                  } else {
                    console.log(JSON.stringify(err));
                    res.status(500).json({success: false, message: 'Could not create user'});
                  }
                }
              } else {

                let continueOperation = true;

                if(req.body.userType !== constant.USER_TYPES.FACILITY_MANAGER){
                  if(!req.body.onBoardRequestId) {
                    continueOperation = false;
                    res.status(422).json({success: false, message: 'Unable to complete registration. Please contact Admin.'});
                  }else{
                    let onBoardRecordUpdateResult = await updateRequest(req.body.onBoardRequestId, {$set:{"isAccountCreated": true}});

                    if(onBoardRecordUpdateResult.status !== constant.SYSTEM_STATUS.SUCCESS) {
                      console.log(JSON.stringify(onBoardRecordUpdateResult));
                      res.status(422).json({success: false, message: ' Failed to complete. Please contact Admin.'});
                      continueOperation = false;
                    }
                  }
                }

                if(continueOperation){
                  await emailNotificationDao.createUserOnboardedNotification({
                    recipient: req.body.email,
                    name: req.body.firstName + ' ' + req.body.lastName,
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    res
                  });

                  console.log("returning response here..");
                  res.status(200).json({success: true, message: 'Account Created'});
                }

              }
            });
          }
        }
      }
    }
  });

  // logging api functionality
  router.post('/user/login', function (req, res) {
    if (!req.body.email) {
      res.status(400).json({success: false, message: 'Email must be provided'});
    } else {
      if (!req.body.password) {
        res.status(400).json({success: false, message: 'No password was provided'});
      } else {
        User.findOne({email: req.body.email}, function (err, user) {
          if (err) {
            res.status(500).json({success: false, message: 'An error occurred'});
          } else {
            if (!user) {
              console.log('User was not found.')
              res.status(400).json({success: false, message: 'Invalid username / password'});
            } else {
              user.comparePassword(req.body.password, (err, isMatch) => {
                if (err || !isMatch) {
                  console.log('Password was invalid');
                  res.status(400).json({success: false,message: 'Invalid username / password'});
                } else {
                  const token = jwt.sign({userId: user._id, name: user.firstname+''+user.lastname,
                    type: user.userType,
                    onBoardedBy: user.onBoardedBy,
                    role: getRoleByUserType(user.userType)}, config.secretKey, {expiresIn: '5h'});
                  res.status(200).json({
                    success: true, message: 'Success!', token: token, user: {
                      id: user._id,
                      email: user.email,
                      firstname: user.firstname,
                      lastname: user.lastname,
                      phoneNumber: user.phoneNumber,
                      name: user.firstname+' '+user.lastname,
                      type: user.userType,
                      onBoardedBy: user.onBoardedBy,
                      role: getRoleByUserType(user.userType)
                    }
                  });
                }
              });

            }
          }
        });
      }
    }
  });

  router.get('/users', tokenChecker, async(req,res) =>{

    var sortOptions = validQueryParameters(req, res);

    let result = await UserDao.findAll(buildSearchQuery(req), sortOptions);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });

  const buildSearchQuery = (req) =>{
    let queryParams = {};

    queryParams.onBoardedBy = ObjectId(req.decoded.userId);
    if(req.query.status && ! _.isEmpty(req.query.status)) queryParams.status = req.query.status;
    if(req.query.firstname && ! _.isEmpty(req.query.firstname)) queryParams.firstname = req.query.firstname;
    if(req.query.lastname && ! _.isEmpty(req.query.lastname)) queryParams.lastname = req.query.lastname;
    if(req.query.email && ! _.isEmpty(req.query.email)) queryParams.email = req.query.email;
    if(req.query.userType && ! _.isEmpty(req.query.userType)) queryParams.userType = req.query.userType;
    if(req.query.phoneNumber && ! _.isEmpty(req.query.phoneNumber)) queryParams.phoneNumber = req.query.phoneNumber;

    return queryParams;
  };


  return router;

};
