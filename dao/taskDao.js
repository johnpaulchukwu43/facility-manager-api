import {appendToObject, genRef, isContainedInObject, isEmpty} from "../common/util";
import {SYSTEM_STATUS, TASK_TYPE, TASK_STATUS} from "../common/constants";
import {sortByAndOrderMapping} from "./baseRequest";
import _ from "lodash";
import EventEmitter from "../events";
import {processTaskNotificationChange} from "../service/userTaskService";


const TaskModel = require('../models/task');

class Task {

  async create(body) {

    let validatedRequest = Task.validateRequest(body, true);

    let {data, messages, status} = validatedRequest;

    if (status !== SYSTEM_STATUS.SUCCESS) return {status, messages};

    data.taskReference = genRef();

    return await this.saveRequestToDb(data);
  }

  static async findAll(searchQuery, param) {
    try {

      console.log(JSON.stringify(param));
      console.log(JSON.stringify(searchQuery));

      var sortBy = sortByAndOrderMapping(param.sortBy, param.order);

      let pagingOption = {page: param.pageNum, limit: param.pageSize, sort: sortBy};

      let occupantLookup = {from: 'users', localField: 'occupantId', foreignField: '_id', as: 'occupantInfo'};

      let artisanLookup = {from: 'users', localField: 'artisanId', foreignField: '_id', as: 'artisanInfo'};

      let assetsLookup = {from: 'assets', localField: 'maintainablesId', foreignField: '_id', as: 'assetInfo'};

      let buildingLookup = {from: 'buildings', localField: 'maintainablesId', foreignField: '_id', as: 'buildingInfo'};

      let roomLookup = {from: 'rooms', localField: 'maintainablesId', foreignField: '_id', as: 'roomInfo'};


      let taskAggregate = TaskModel.aggregate()
        .match(searchQuery)
        .lookup(artisanLookup)
        .lookup(occupantLookup)
        .lookup(buildingLookup)
        .lookup(roomLookup)
        .lookup(assetsLookup)
        .unwind();

      let data = await TaskModel.aggregatePaginate(taskAggregate, pagingOption);

      return {status: SYSTEM_STATUS.SUCCESS, data: data};
    } catch (e) {
      console.log(e);
      return {message: "Error getting record", status: SYSTEM_STATUS.ERROR};
    }

  };

  static async getTaskCount(searchQuery){
    try{

      console.log("tasck count param:"+JSON.stringify(searchQuery));
    let taskCount = await TaskModel.aggregate()
      .match(searchQuery)
      .count("taskCount");

      return {status: SYSTEM_STATUS.SUCCESS, data: taskCount};
    } catch (e) {
      console.log(e);
      return {message: "Error getting record", status: SYSTEM_STATUS.ERROR};
    }
  }



  async update(id, body) {

    let validatedRequest = Task.validateRequest(body, false);

    let {data, messages, status} = validatedRequest;

    if (status !== SYSTEM_STATUS.SUCCESS) return {status, messages};

    let matchQuery = {"_id": id};

    let updateBody = {"$set": data};

    try {
      let model = await TaskModel.findOneAndUpdate(matchQuery, updateBody, {returnNewDocument: true});

      console.log(JSON.stringify(model));

      if (model === null) return {message: "No record found for update", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error updating task", status: SYSTEM_STATUS.ERROR};
    }

  };

  async assignToArtisan(taskId, req, res) {

    let artisanId = req.body.artisanId;
    let facilityManagerId = req.body.facilityManagerId;

    if (!artisanId || isEmpty(artisanId)) {
      let response = {message: "artisanId is required", status: SYSTEM_STATUS.FAILED};
      return res.status(400).json(response);
    }

    if (!facilityManagerId || isEmpty(facilityManagerId)) {
      let response = {message: "facilityManagerId is required", status: SYSTEM_STATUS.FAILED};
      return res.status(400).json(response);
    }

    let matchQuery = {
      "_id": taskId,
      "status": {$in: [TASK_STATUS.LOGGED_SUCCESS, TASK_STATUS.RECEIVED_BY_MANAGER]},
      facilityManagerId
    };

    let updateBody = {"$set": {"status": TASK_STATUS.ASSIGNED_TO_ARTISAN, artisanId}};

    try {

      let model = await TaskModel.findOneAndUpdate(matchQuery, updateBody, {new: true});

      if (model === null) {
        let response = {message: "No record found for update", status: SYSTEM_STATUS.FAILED};
        return res.status(422).json(response);
      }

      await processTaskNotificationChange({
        oldStatus: TASK_STATUS.ASSIGNED_TO_ARTISAN,
        newStatus: TASK_STATUS.ASSIGNED_TO_ARTISAN,
        task: model
      }, res, true);

      return {status: SYSTEM_STATUS.SUCCESS, model};
    } catch (e) {
      console.log(e);
      let response = {message: "Error updating task", status: SYSTEM_STATUS.ERROR};
      return res.status(500).json(response);
    }


  }

  static async updateStatus(taskId, req, res) {
    let messages = [];

    let {oldStatus, newStatus, artisanImageUploadUrl, facilityManagerId} = req.body;

    if (!facilityManagerId || isEmpty(facilityManagerId)) {
      let response = {status: SYSTEM_STATUS.FAILED, messages: [`facilityManagerId is required.`]};
      return res.status(400).json(response);
    }

    if (!isContainedInObject(TASK_STATUS, oldStatus)) {
      let response = {status: SYSTEM_STATUS.FAILED, messages: [`Unrecognized oldStatus value: ${oldStatus}`]};
      return res.status(400).json(response);
    }

    if (!isContainedInObject(TASK_STATUS, newStatus)) {
      let response = {status: SYSTEM_STATUS.FAILED, messages: [`Unrecognized newStatus value: ${newStatus}`]};
      return res.status(400).json(response);
    }

    if (oldStatus === newStatus) {
      let response = {status: SYSTEM_STATUS.FAILED, messages: [`old and new status cannot be the same`]};
      return res.status(400).json(response);
    }

    let updateBody = {"$set": {"status": newStatus}};


    switch (newStatus) {

      case TASK_STATUS.RECEIVED_BY_MANAGER:
        if (oldStatus !== TASK_STATUS.LOGGED_SUCCESS) {
          messages.push(`Task cannot go from: ${oldStatus} to ${newStatus}`);
        }
        break;

      case TASK_STATUS.ASSIGNED_TO_ARTISAN:
        if (oldStatus !== TASK_STATUS.LOGGED_SUCCESS && oldStatus !== TASK_STATUS.RECEIVED_BY_MANAGER) {
          messages.push(`Task cannot go from: ${oldStatus} to ${newStatus}`);
        }
        break;

      case TASK_STATUS.RECEIVED_BY_ARTISAN:
        if (oldStatus !== TASK_STATUS.LOGGED_SUCCESS && oldStatus !== TASK_STATUS.RECEIVED_BY_MANAGER && oldStatus !== TASK_STATUS.ASSIGNED_TO_ARTISAN) {
          messages.push(`Task cannot go from: ${oldStatus} to ${newStatus}`);
        }
        break;

      case TASK_STATUS.TASK_IN_PROGRESS:
        if (oldStatus === TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW || oldStatus === TASK_STATUS.COMPLETED || oldStatus === TASK_STATUS.CLOSED) {
          messages.push(`Task cannot go from: ${oldStatus} to ${newStatus}`);
        }
        break;

      case TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW:
        if (oldStatus === TASK_STATUS.COMPLETED || oldStatus === TASK_STATUS.CLOSED) {
          messages.push(`Task cannot go from: ${oldStatus} to ${newStatus}`);
        }
        if (isEmpty(artisanImageUploadUrl)) {
          messages.push(`artisanImageUploadUrl is required to transition to ${newStatus}`);
        } else {
          updateBody = {"$set": {"status": newStatus, "artisanImageUploadUrl": artisanImageUploadUrl}};
        }
        break;

      case TASK_STATUS.COMPLETED:
        if (oldStatus !== TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW) {
          messages.push(`Task can only be marked as completed, after it marked as pending review by artisan.`);
        }
        break;

    }

    if (messages.length !== 0) {
      let response = {status: SYSTEM_STATUS.FAILED, messages};
      return res.status(400).json(response);
    }

    let matchQuery = {"_id": taskId, "status": oldStatus, facilityManagerId};


    try {

      let model = await TaskModel.findOneAndUpdate(matchQuery, updateBody, {returnNewDocument: true});

      if (model === null) {
        let response = {messages: ["No record found for update"], status: SYSTEM_STATUS.FAILED};
        return res.status(422).json(response);
      }

      await processTaskNotificationChange({oldStatus, newStatus, task: model}, res, true);

      return {status: SYSTEM_STATUS.SUCCESS, model};
    } catch (e) {
      console.log(e);
      let response = {messages: ["Error updating task"], status: SYSTEM_STATUS.ERROR};
      return res.status(500).json(response);
    }

  }

  async findById(id) {

    if (!id) return {message: "Bad Request. Id is required.", status: SYSTEM_STATUS.FAILED};

    try {
      let data = await TaskModel.findOne({"_id": id});

      if (data === null) return {message: "No record found", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error getting record", status: SYSTEM_STATUS.ERROR};
    }

  };

  static validateRequest(body, isCreate) {

    //todo validate name as unique and  maintainablesId, maintainablesType, taskRequestedBy as valid in db or as constants


    let messages = [];

    let {name, facilityManagerId, maintainablesType, maintainablesId, taskType, status, occupantId, occupantImageUploadUrl, taskRequestedBy, artisanId, taskFrequency} = body;

    if (!name || isEmpty(name)) {
      messages.push('name is required');
    } else if (name.length < 3) {
      messages.push('name must have atleast 3 characters');
    } else if (name.length > 50) {
      messages.push('name cannot have more than 50 characters');
    }

    if (status) {
      //ensure that status cannot be updated
      messages.push('unexpected field status, please remove.');
    }
    if (!status && isCreate) {
      body.status = TASK_STATUS.LOGGED_SUCCESS;
    }

    if (artisanId && !isCreate) {
      //ensure that artisanId cannot be updated
      messages.push('unexpected field artisanId, please remove.');
    } else if (artisanId) {
      body.status = TASK_STATUS.ASSIGNED_TO_ARTISAN;
    }

    if ((occupantId || occupantImageUploadUrl) && !isCreate) {
      messages.push('unexpected field either: occupantId or occupantImageUploadUrl.Please remove.');
    } else if ((occupantId && !occupantImageUploadUrl) || (!occupantId && occupantImageUploadUrl)) {
      messages.push('occupantId and occupantImageUploadUrl should both be provided or none at all.');
    }


    if (!facilityManagerId || isEmpty(facilityManagerId)) messages.push('facilityManagerId is required');

    if (!maintainablesType || isEmpty(maintainablesType)) messages.push('maintainablesType is required');

    if (!maintainablesId || isEmpty(maintainablesId)) messages.push('maintainablesId is required');

    if (!taskType || isEmpty(taskType)) {
      messages.push('taskType is required');
    } else if (taskType === TASK_TYPE.PERIODIC && !taskFrequency) {

      messages.push('TaskFrequency is required for taskTypes of PERIODIC');
    }

    if (!taskRequestedBy || isEmpty(taskRequestedBy)) messages.push('taskRequestedBy is required');


    if (messages.length === 0) {
      return {status: SYSTEM_STATUS.SUCCESS, data: body};
    }

    return {status: SYSTEM_STATUS.FAILED, messages}

  };

  async saveRequestToDb(request) {
    let productModel = new TaskModel(request);

    try {
      let data = await productModel.save();
      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(JSON.stringify(e));
      return {messages: ["Error creating Task"], status: SYSTEM_STATUS.ERROR};
    }
  };
}

export default Task
