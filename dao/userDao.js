
import {SYSTEM_STATUS, USER_TYPES} from "../common/constants";
import {sortByAndOrderMapping} from "./baseRequest";

const UserModel = require('../models/user');

class User {

  async create(body) {}

  static async findAll(searchQuery,param) {
    try {
      console.log(JSON.stringify(param));
      console.log(JSON.stringify(searchQuery));

      var sortBy = sortByAndOrderMapping(param.sortBy,param.order);

      let data = await UserModel.paginate(searchQuery, {page: param.pageNum, limit:param.pageSize,sort:sortBy});

      return {status: SYSTEM_STATUS.SUCCESS, data: data.docs};
    } catch (e) {
      console.log(e);
      return {message: "Error getting user", status: SYSTEM_STATUS.ERROR};
    }

  };


  async update(id,body) {};

  async updateStatus(id, oldStatus, newStatus, res){
  }

  async findById(id) {

    if(!id) return {message: "Bad Request. Id is required.", status: SYSTEM_STATUS.FAILED};

    try {
      let data = await UserModel.findOne({"_id": id});

      if (data === null) return {message: "No user found", status: SYSTEM_STATUS.FAILED};

      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(e);
      return {message: "Error getting user", status: SYSTEM_STATUS.ERROR};
    }

  };


  static async getUserCount(searchQuery){



    let message;

    let isValid = true;

    switch (searchQuery.userType) {

      case USER_TYPES.FACILITY_MANAGER:
      case USER_TYPES.ARTISAN:
      case USER_TYPES.OCCUPANT:
        break;
      default:
        isValid = false;
        message = `Unrecognized userType value: ${searchQuery.userType}`;
        break;
    }

    if(!isValid){
      return {status: SYSTEM_STATUS.FAILED, message}
    }

    try{
      console.log(`searching with query param:${JSON.stringify(searchQuery)}`);
      let userCount = await UserModel.aggregate()
        .match(searchQuery)
        .count("userCount");
      return {status: SYSTEM_STATUS.SUCCESS, data: userCount}
    }catch (e) {
      console.log(JSON.stringify(e));
      return {message: "Error getting count", status: SYSTEM_STATUS.ERROR};
    }


  }


  async saveRequestToDb(request) {
    let productModel = new UserModel(request);

    try {
      let data = await productModel.save();
      return {status: SYSTEM_STATUS.SUCCESS, data};
    } catch (e) {
      console.log(JSON.stringify(e));
      return {messages: ["Error creating User"], status: SYSTEM_STATUS.ERROR};
    }
  };
}

export default User
