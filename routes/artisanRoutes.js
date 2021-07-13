import {SYSTEM_STATUS, TASK_TYPE, TASK_REQUESTED_BY, TASK_STATUS} from "../common/constants";
import Task from "../dao/taskDao";
import {isEmpty} from "../common/util";
import _ from "lodash"
import {validQueryParameters} from "../common/validation";

const tokenChecker = require("../common/util").tokenChecker;
const ObjectId = require('../models/baseMongoose').Types.ObjectId;


module.exports = function (router) {

  router.get('/artisan/tasks', tokenChecker, async(req,res) =>{

    var sortOptions = validQueryParameters(req, res);

    if(!req.query.facilityManagerId || isEmpty(req.query.facilityManagerId)) return res.status(400).json({status: SYSTEM_STATUS.FAILED, message: "facilityManagerId is required"});

    let result = await Task.findAll(buildSearchQuery(req), sortOptions);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });


  router.put('/artisan/task/update-status/:taskId', tokenChecker, async (req, res) =>{
    let taskId = req.params.taskId;
    await Task.updateStatus(taskId,req,res);

  });


  const buildSearchQuery = (req) =>{
    let queryParams = {};

    queryParams.artisanId = ObjectId(req.decoded.userId);
    queryParams.facilityManagerId = ObjectId(req.query.facilityManagerId);
    if(req.query.name && ! _.isEmpty(req.query.name)) queryParams.name = req.query.name;
    if(req.query.status && ! _.isEmpty(req.query.status)) queryParams.status = req.query.status;
    if(req.query.maintainablesType && ! _.isEmpty(req.query.maintainablesType)) queryParams.maintainablesType = req.query.maintainablesType;
    if(req.query.maintainablesId && ! _.isEmpty(req.query.maintainablesId)) queryParams.maintainablesId = req.query.maintainablesId;
    if(req.query.taskType && ! _.isEmpty(req.query.taskType)) queryParams.taskType = req.query.taskType;
    if(req.query.taskRequestedBy && ! _.isEmpty(req.query.taskRequestedBy)) queryParams.taskRequestedBy = req.query.taskRequestedBy;
    if(req.query.occupantId && ! _.isEmpty(req.query.occupantId)) queryParams.occupantId = ObjectId(req.query.occupantId);

    return queryParams;
  };

  return router;

};
