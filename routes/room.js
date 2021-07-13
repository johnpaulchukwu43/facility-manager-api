import {SYSTEM_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";

const Room = require('../models/room');
const Asset = require('../models/asset');
const tokenChecker = require("../common/util").tokenChecker;

import Maintainable from "../dao/maintenableDao";
import {appendToObject} from "../common/util";


module.exports = function (router) {

  //API to get a particular provider
  router.post('/rooms', tokenChecker, async (req, res) =>{

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.ROOM});

    let maintainable = new Maintainable(Room);

    let result = await maintainable.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });

  router.get('/rooms', tokenChecker,async (req,res) => {

    let floorId = req.query.floorId;

    let maintainable = new Maintainable(Room);

    let {status,data,message} = await maintainable.findAll({floorId: floorId, type: MAINTENABLES_TYPE.ROOM});

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Rooms', data});

  });

  router.get('/rooms/:roomId', tokenChecker,async (req,res) => {

    let maintainable = new Maintainable(Room);

    let {status,data,message} = await maintainable.findById(req.params.roomId);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Room', data});

  });


  router.put('/rooms/:roomId', tokenChecker,async (req,res) => {

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.ROOM});

    let maintainable = new Maintainable(Room);

    let {status,data,messages} = await maintainable.update(req.params.roomId,body);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, messages});

    res.status(200).json({status, message: 'Updated Floor', data});

  });

  router.get('/rooms/assets/:roomId', tokenChecker,async (req,res) => {

    let roomId = req.params.roomId;

    let maintainable = new Maintainable(Asset);

    let {status,data,message} = await maintainable.findAll({roomId:roomId, type: MAINTENABLES_TYPE.ASSET});

    if(status === SYSTEM_STATUS.FAILED) return res.status(422).json({status,message});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,message});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });


  return router;

};
