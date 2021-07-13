import {SYSTEM_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";

const Asset = require('../models/asset');
const tokenChecker = require("../common/util").tokenChecker;

import Maintainable from "../dao/maintenableDao";
import {appendToObject} from "../common/util";


module.exports = function (router) {

  //API to get a particular provider
  router.post('/assets', tokenChecker, async (req, res) =>{

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.ASSET});

    let maintainable = new Maintainable(Asset);

    let result = await maintainable.create(body);

    let {status, data, messages} = result;

    if(status === SYSTEM_STATUS.FAILED) return res.status(400).json({status,messages});
    if(status === SYSTEM_STATUS.ERROR) return res.status(500).json({status,messages});
    if(status === SYSTEM_STATUS.SUCCESS) return res.status(200).json({status,data});
  });

  router.get('/assets', tokenChecker,async (req,res) => {

    let roomId = req.query.roomId;

    let maintainable = new Maintainable(Asset);

    let {status,data,message} = await maintainable.findAll({roomId: roomId, type: MAINTENABLES_TYPE.ASSET});

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Assets', data});

  });

  router.get('/assets/:assetId', tokenChecker,async (req,res) => {

    let maintainable = new Maintainable(Asset);

    let {status,data,message} = await maintainable.findById(req.params.assetId);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, message});

    res.status(200).json({status, message: 'Fetched Asset', data});

  });


  router.put('/assets/:assetId', tokenChecker,async (req,res) => {

    let maintainable = new Maintainable(Asset);

    let body = appendToObject(req.body,{type: MAINTENABLES_TYPE.ASSET});

    let {status,data,messages} = await maintainable.update(req.params.assetId, body);

    if(status !== SYSTEM_STATUS.SUCCESS) return res.status(500).json({status, messages});

    res.status(200).json({status, message: 'Updated Asset', data});

  });


  return router;

};
