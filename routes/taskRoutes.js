import {SYSTEM_STATUS} from "../common/constants";
import Task from "../dao/taskDao";
import {appendToObject} from "../common/util";
import _ from "lodash"
import {validQueryParameters} from "../common/validation";
const ObjectId = require('../models/baseMongoose').Types.ObjectId;

const tokenChecker = require("../common/util").tokenChecker;


module.exports = function (router) {

  router.post('/tasks', tokenChecker, async (req, res) =>{
    let facilityManagerId = req.decoded.userId;

    let body = appendToObject(req.body,{facilityManagerId});

    let task = new Task(body);

    let result = await task.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });


  router.get('/tasks', tokenChecker, async(req,res) =>{

    var sortOptions = validQueryParameters(req, res);

    let result = await Task.findAll(buildSearchQuery(req), sortOptions);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });

  router.put('/tasks/:taskId', tokenChecker, async (req, res) =>{
    let facilityManagerId = req.decoded.userId;
    let taskId = req.params.taskId;

    let body = appendToObject(req.body,{facilityManagerId});

    let task = new Task();

    let result = await task.update(taskId,body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });



  router.put('/tasks/update-status/:taskId', tokenChecker, async (req, res) =>{
    let taskId = req.params.taskId;

    req.body.facilityManagerId = req.decoded.userId;

    await Task.updateStatus(taskId,req,res);

  });

  router.put('/tasks/assign-artisan/:taskId', tokenChecker, async (req, res) =>{
    let taskId = req.params.taskId;
    let task = new Task();
    await task.assignToArtisan(taskId,req,res);

  });


  const buildSearchQuery = (req) =>{
    let queryParams = {};

    queryParams.facilityManagerId = ObjectId(req.decoded.userId);
    if(req.query.name && ! _.isEmpty(req.query.name)) queryParams.name = req.query.name;
    if(req.query.status && ! _.isEmpty(req.query.status)) queryParams.status = req.query.status;
    if(req.query.maintainablesType && ! _.isEmpty(req.query.maintainablesType)) queryParams.maintainablesType = req.query.maintainablesType;
    if(req.query.maintainablesId && ! _.isEmpty(req.query.maintainablesId)) queryParams.maintainablesId = req.query.maintainablesId;
    if(req.query.taskType && ! _.isEmpty(req.query.taskType)) queryParams.taskType = req.query.taskType;
    if(req.query.taskRequestedBy && ! _.isEmpty(req.query.taskRequestedBy)) queryParams.taskRequestedBy = req.query.taskRequestedBy;
    if(req.query.occupantId && ! _.isEmpty(req.query.occupantId)) queryParams.occupantId = ObjectId(req.query.occupantId);
    if(req.query.artisanId && ! _.isEmpty(req.query.artisanId)) queryParams.artisanId = ObjectId(req.query.artisanId);

    return queryParams;
  };

  return router;

};
