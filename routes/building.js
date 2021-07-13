import {SYSTEM_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";

const Building = require('../models/building');
const Floor = require('../models/floor');
const tokenChecker = require("../common/util").tokenChecker;
import {appendToObject} from "../common/util";

import Maintainable from "../dao/maintenableDao";


module.exports = function (router) {

  //API to get a particular building
  router.post('/buildings', tokenChecker, async (req, res) =>{

    let facilityManagerId = req.decoded.userId;

    let maintainable = new Maintainable(Building);

    let body = appendToObject(req.body,{facilityManagerId:facilityManagerId, type: MAINTENABLES_TYPE.BUILDING});

    let result = await maintainable.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });

  router.get('/buildings',async (req,res) => {

    let facilityManagerId = req.query.facilityManagerId;

    if(!facilityManagerId) return res.status(400).json({status: SYSTEM_STATUS.FAILED,message:"facilityManagerId is required"});

    let maintainable = new Maintainable(Building);

    let {status,data,message} = await maintainable.findAll({facilityManagerId: facilityManagerId, type: MAINTENABLES_TYPE.BUILDING});

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Buildings', data});

  });

  router.get('/buildings/:id', tokenChecker,async (req,res) => {

    let maintainable = new Maintainable(Building);

    let {status,data,message} = await maintainable.findById(req.params.id);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Buildings', data});

  });


  router.put('/buildings/:id', tokenChecker,async (req,res) => {
    let facilityManagerId = req.decoded.userId;

    let maintainable = new Maintainable(Building);

    let body = appendToObject(req.body,{facilityManagerId:facilityManagerId, type: MAINTENABLES_TYPE.BUILDING});

    let {status,data,messages} = await maintainable.update(req.params.id, body);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, messages});

    res.status(200).json({status, message: 'Updated Buildings', data});

  });

  router.get('/buildings/floors/:buildingId', tokenChecker,async (req,res) => {
    let buildingId = req.params.buildingId;

    let maintainable = new Maintainable(Floor);

    let {status,data,message} = await maintainable.findAll({buildingId:buildingId, type: MAINTENABLES_TYPE.FLOOR});

    if(status === SYSTEM_STATUS.FAILED) return res.status(422).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });


  return router;

};
