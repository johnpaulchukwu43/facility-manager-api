import {SYSTEM_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";

const Floor = require('../models/floor');
const Room = require('../models/room');
const tokenChecker = require("../common/util").tokenChecker;

import Maintainable from "../dao/maintenableDao";
import {appendToObject} from "../common/util";


module.exports = function (router) {

  //API to get a particular provider
  router.post('/floors', tokenChecker, async (req, res) =>{

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.FLOOR});

    let maintainable = new Maintainable(Floor);

    let result = await maintainable.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });

  router.get('/floors', tokenChecker,async (req,res) => {

    let buildingId = req.query.buildingId;

    let maintainable = new Maintainable(Floor);

    let {status,data,message} = await maintainable.findAll({buildingId: buildingId, type: MAINTENABLES_TYPE.FLOOR});

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Floors', data});

  });

  router.get('/floors/:floorId', tokenChecker,async (req,res) => {

    let maintainable = new Maintainable(Floor);

    let {status,data,message} = await maintainable.findById(req.params.floorId);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Floor', data});

  });


  router.put('/floors/:floorId', tokenChecker,async (req,res) => {

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.FLOOR});

    let maintainable = new Maintainable(Floor);

    let {status,data,messages} = await maintainable.update(req.params.floorId, body);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, messages});

    res.status(200).json({status, message: 'Updated Floor', data});

  });

  router.get('/floors/rooms/:floorId', tokenChecker,async (req,res) => {

    let floorId = req.params.floorId;

    let maintainable = new Maintainable(Room);

    let {status,data,message} = await maintainable.findAll({floorId:floorId, type: MAINTENABLES_TYPE.ROOM});

    if(status === SYSTEM_STATUS.FAILED) return res.status(422).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });


  return router;

};
