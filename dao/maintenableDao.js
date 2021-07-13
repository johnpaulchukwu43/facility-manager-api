import {appendToObject} from "../common/util";
import {SYSTEM_STATUS, USER_TYPES} from "../common/constants";
import {MAINTINABLE_STATUS} from "../common/constants";
import {MAINTENABLES_TYPE} from "../common/constants";


class Maintenables {


  constructor(model) {

    this.model = model;
  }

  async create(body) {

    let validatedRequest = Maintenables.validateRequest(body);

    let {data, messages, status} = validatedRequest;

    if (status !== SYSTEM_STATUS.SUCCESS) return {status, messages};

    return await this.saveRequestToDb(data);
  }

  async findAll(extraPam) {
    try {
      let searchParam = Maintenables.extractSearchParams(extraPam);

      let data = await this.model.find(searchParam);

      if (data === null) return {message: "No record found", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error getting record", status: SYSTEM_STATUS.ERROR};
    }

  };

  async update(id,body) {

    let validatedRequest = Maintenables.validateRequest(body);

    let {data, messages, status} = validatedRequest;

    if (status !== SYSTEM_STATUS.SUCCESS) return {status, messages};

    let matchQuery = {"_id":id};

    let updateBody = {"$set": data};

    try {
      let model = await this.model.findOneAndUpdate(matchQuery,updateBody,{ returnNewDocument: true });

      if (model === null) return {message: "No record found for update", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error updating record", status: SYSTEM_STATUS.ERROR};
    }

  };

  async findById(id) {

    if(!id) return {message: "Bad Request. Id is required.", status: SYSTEM_STATUS.FAILED};

    try {
      let data = await this.model.findOne({"_id": id});

      if (data === null) return {message: "No record found", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error getting record", status: SYSTEM_STATUS.ERROR};
    }

  };

  async getTotalCount(){
    try{
      let itemCount = await this.model.aggregate().count("itemCount");

      return {status: SYSTEM_STATUS.SUCCESS, data: itemCount}
    }catch (e) {
      console.log(JSON.stringify(e));
      return {message: "Error getting count", status: SYSTEM_STATUS.ERROR};
    }
  }

  static extractSearchParams(extraPam) {
    let searchParam = {};
    switch (extraPam.type) {
      case MAINTENABLES_TYPE.BUILDING:
        searchParam = {facilityManagerId: extraPam.facilityManagerId};
        break;

      case MAINTENABLES_TYPE.FLOOR:
        searchParam = {buildingId: extraPam.buildingId};
        break;

      case MAINTENABLES_TYPE.ROOM:
        searchParam = {floorId: extraPam.floorId};
        break;

      case MAINTENABLES_TYPE.ASSET:
        searchParam = {roomId: extraPam.roomId};
        break;
      default:
        break;
    }
    return searchParam;
  }

  static extractUpdateParams(extraPam, id) {
    let searchParam = {};
    switch (extraPam.type) {
      case MAINTENABLES_TYPE.BUILDING:
        searchParam = {_id: id, facilityManagerId: extraPam.facilityManagerId};
        break;

      case MAINTENABLES_TYPE.FLOOR:
        searchParam = {_id: id,buildingId: extraPam.buildingId};
        break;

      case MAINTENABLES_TYPE.ROOM:
        searchParam = {_id: id, floorId: extraPam.floorId};
        break;

      case MAINTENABLES_TYPE.ASSET:
        searchParam = {_id: id, roomId: extraPam.roomId};
        break;
      default:
        break;
    }
    return searchParam;
  }

  static validateRequest(body) {

    let messages = [];

    let {name,type, status} = body;

    if (!name) messages.push('name is required');

    if(!status) {
      body = appendToObject(body, {status: MAINTINABLE_STATUS.ACTIVE});
    }


    switch (type) {

      case MAINTENABLES_TYPE.BUILDING:
        if (!body.facilityManagerId) {
          messages.push('facilityManagerId is required');
        }
        break;

      case MAINTENABLES_TYPE.FLOOR:
        if (!body.buildingId) {
          messages.push('buildingId is required');
        }
        break;

      case MAINTENABLES_TYPE.ROOM:
        if (!body.floorId) {
          messages.push('floorId is required');
        }
        break;

      case MAINTENABLES_TYPE.ASSET:
        if (!body.roomId) {
          messages.push('roomId is required');
        }
        //todo validate assetCategory as valid type
        if (!body.assetCategory) {
          messages.push('assetCategory is required');
        }

        if (!body.identificationNumber) {
          messages.push('identificationNumber is required');
        }
        break;
      default:
        messages.push(`Error creating ${type}. Please contact Admin.`);
        break;
    }

    if (messages.length === 0) return {status: SYSTEM_STATUS.SUCCESS, data: body};

    return {status: SYSTEM_STATUS.FAILED, messages}

  };

  async saveRequestToDb(request) {
    let productModel = new this.model(request);

    try {
      let data = await productModel.save();
      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(JSON.stringify(e));
      return {messages: ["Error saving record"], status: SYSTEM_STATUS.ERROR};
    }
  };
}

export default Maintenables
