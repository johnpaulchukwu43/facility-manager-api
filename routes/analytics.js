import {SYSTEM_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";
const asset = require('../models/asset');
const tokenChecker = require("../common/util").tokenChecker;

import Maintainable from "../dao/maintenableDao";
import TaskDao from "../dao/taskDao";
import {appendToObject} from "../common/util";
import {byStatusIn} from "../dbqueries/index";
const ObjectId = require('../models/baseMongoose').Types.ObjectId;

import UserDao from "../dao/userDao";
import _ from "lodash";
import {validateIsStringOrArray} from "../common/validation";


module.exports = function (router) {

  router.get('/analytics/user/count', tokenChecker, async (req,res) =>{

    let queryParams = {};

    queryParams.onBoardedBy = ObjectId(req.decoded.userId);
    if(req.query.userType && ! _.isEmpty(req.query.userType)) queryParams.userType = req.query.userType;

    let result = await UserDao.getUserCount(queryParams);

    let {status, data, message} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });

  router.get('/analytics/assets/count', tokenChecker, async (req,res) =>{

    let maintainable = new Maintainable(asset);

    let result = await maintainable.getTotalCount();

    let {status, data, message} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });

  router.get('/analytics/tasks/count', tokenChecker, async (req,res) =>{

    let result = await TaskDao.getTaskCount(buildSearchQuery(req));

    let {status, data, message} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});

  });


  const buildSearchQuery = (req) =>{
    let queryParams = {};

    if(req.query.name && ! _.isEmpty(req.query.name)) queryParams.name = req.query.name;
    if(req.query.status && ! _.isEmpty(req.query.status)) queryParams.status = req.query.status;
    if(req.query.maintainablesType && ! _.isEmpty(req.query.maintainablesType)) queryParams.maintainablesType = req.query.maintainablesType;
    if(req.query.maintainablesId && ! _.isEmpty(req.query.maintainablesId)) queryParams.maintainablesId = req.query.maintainablesId;
    if(req.query.taskType && ! _.isEmpty(req.query.taskType)) queryParams.taskType = req.query.taskType;
    if(req.query.taskRequestedBy && ! _.isEmpty(req.query.taskRequestedBy)) queryParams.taskRequestedBy = req.query.taskRequestedBy;
    if(req.query.occupantId && ! _.isEmpty(req.query.occupantId)) queryParams.occupantId = ObjectId(req.query.occupantId);
    if(req.query.artisanId && ! _.isEmpty(req.query.artisanId)) queryParams.artisanId = ObjectId(req.query.artisanId);
    if(req.query.facilityManagerId && ! _.isEmpty(req.query.facilityManagerId)) queryParams.facilityManagerId = ObjectId(req.query.facilityManagerId);
    if(req.query.statusIn && ! _.isEmpty(req.query.statusIn)) {
      let statuses = validateIsStringOrArray(req.query.statusIn);
      queryParams = appendToObject(byStatusIn(statuses), queryParams);
    }

    return queryParams;
  };

  return router;

};
