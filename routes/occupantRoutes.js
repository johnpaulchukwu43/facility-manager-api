import {SYSTEM_STATUS, TASK_TYPE, TASK_REQUESTED_BY, TASK_STATUS} from "../common/constants";
import Task from "../dao/taskDao";
import {appendToObject, isEmpty} from "../common/util";
import _ from "lodash"
import {validQueryParameters} from "../common/validation";
import {processTaskNotificationChange} from "../service/userTaskService";
const ObjectId = require('../models/baseMongoose').Types.ObjectId;

const tokenChecker = require("../common/util").tokenChecker;


module.exports = function (router) {

  router.post('/occupant/complaints', tokenChecker, async (req, res) =>{
    // expected request: name, description, facilityManagerId, maintainablesType, maintainablesId, taskType, taskRequestedBy, occupantId, occupantImageUploadUrl

    let occupantId = req.decoded.userId;

    let taskType = TASK_TYPE.SIMPLE;

    let taskRequestedBy = TASK_REQUESTED_BY.CLIENT;

    let body = appendToObject(req.body,{occupantId,taskType,taskRequestedBy});

    let task = new Task();

    let result = await task.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});

    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});

    if(status === SYSTEM_STATUS.SUCCESS) {
      //call service to async trigger status change notification
      try{
        processTaskNotificationChange({oldStatus: TASK_STATUS.LOGGED_SUCCESS, newStatus: TASK_STATUS.LOGGED_SUCCESS, task: data}, res, false);
      }catch (e) {
        console.log("Error after creating complaint:"+e);
      }
      return res.status(200).json({status,data});
    }
  });


  router.get('/occupant/complaints', tokenChecker, async(req,res) =>{

    var sortOptions = validQueryParameters(req, res);

    if(!req.query.facilityManagerId || isEmpty(req.query.facilityManagerId)) return res.status(400).json({status: SYSTEM_STATUS.FAILED, message: "facilityManagerId is required"});

    let result = await Task.findAll(buildSearchQuery(req), sortOptions);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });


  router.put('/occupant/complaints/update-status/:taskId', tokenChecker, async (req, res) =>{
    let taskId = req.params.taskId;

    await Task.updateStatus(taskId,req,res);

  });


  const buildSearchQuery = (req) =>{
    let queryParams = {};

    queryParams.occupantId = ObjectId(req.decoded.userId);
    queryParams.facilityManagerId = ObjectId(req.query.facilityManagerId);
    if(req.query.name && ! _.isEmpty(req.query.name)) queryParams.name = req.query.name;
    if(req.query.status && ! _.isEmpty(req.query.status)) queryParams.status = req.query.status;
    if(req.query.maintainablesType && ! _.isEmpty(req.query.maintainablesType)) queryParams.maintainablesType = req.query.maintainablesType;
    if(req.query.maintainablesId && ! _.isEmpty(req.query.maintainablesId)) queryParams.maintainablesId = req.query.maintainablesId;
    if(req.query.taskType && ! _.isEmpty(req.query.taskType)) queryParams.taskType = req.query.taskType;
    if(req.query.taskRequestedBy && ! _.isEmpty(req.query.taskRequestedBy)) queryParams.taskRequestedBy = req.query.taskRequestedBy;
    if(req.query.artisanId && ! _.isEmpty(req.query.artisanId)) queryParams.artisanId = req.query.artisanId;

    return queryParams;
  };

  return router;

};
