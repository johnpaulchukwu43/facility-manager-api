/*
 Created by Johnpaul Chukwu @ $

 Roles and Authorities on System
*/

import {USER_TYPES} from "./constants";

const roles = {
  SUPER_ADMIN: "super-admin",
  FACILITY_MANAGER: "facility-manager",
  ARTISAN: "artisan",
  OCCUPANT: "occupant"
};

const getRoleByUserType = (userType) =>{

  switch (userType) {
    case USER_TYPES.FACILITY_MANAGER :
      return roles.FACILITY_MANAGER;

    case USER_TYPES.ARTISAN:
      return roles.ARTISAN;

    default:
      return roles.OCCUPANT;
  }




};

module.exports = {
  roles: roles,
  getRoleByUserType
};
