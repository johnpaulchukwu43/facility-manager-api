/*
 Created by Johnpaul Chukwu @ $
*/


const listOfCollections = [];

const SYSTEM_STATUS = {
  ERROR: "ERROR",
  FAILED: "FAILED",
  SUCCESS: "SUCCESS",
};


const NOTIFICATION_STATUS = {
  PENDING: "PENDING",
  FAILED: "FAILED",
  COMPLETED: "COMPLETED",
};


const USER_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const USER_TYPES = {
  SYSTEM:"System",
  FACILITY_MANAGER:"facilityManager",
  ARTISAN:"Artisan",
  OCCUPANT:"Occupant"
};

const MAINTENABLES_TYPE = {
  FLOOR:"Floor",
  ROOM:"Room",
  BUILDING:"Building",
  ASSET:"Asset"
};

const MAINTINABLE_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const TASK_REQUESTED_BY = {
  MANAGER: "REQUESTED_BY_MANAGER",
  CLIENT: "REQUESTED_BY_CLIENT",
  SYSTEM: "SYSTEM",
};

const TASK_TYPE = {
  SIMPLE: "SIMPLE",
  PERIODIC: "PERIODIC"
};

const TASK_STATUS = {
  LOGGED_SUCCESS: "logged successfully",
  RECEIVED_BY_MANAGER: "Received by Manager",
  ASSIGNED_TO_ARTISAN: "Assigned to Artisan",
  RECEIVED_BY_ARTISAN: "Received by Artisan",
  TASK_IN_PROGRESS: "work in progress",
  TASK_COMPLETE_PENDING_REVIEW: "work complete, pending review",
  COMPLETED: "work complete",
  CLOSED: "closed"
};

//todo move asset category to db
const ASSET_CATEGORY = {

    ELECTRONICS: "ELECTRONICS",
    FURNITURE: "FURNITURE",
    MISCELLANEOUS: "MISCELLANEOUS"
  }
;


const NOTIFICATION_TYPES = {
  MANAGER_ONBOARDED: "MANAGER_ONBOARDED",
  MANAGER_TO_CLIENT_ONBOARD_REQUEST: "MANAGER_TO_CLIENT_ONBOARD_REQUEST",
  TASK_LOGGED_SUCCESS:"TASK_LOGGED_SUCCESS",
  TASK_RECEIVED_BY_MANAGER:"TASK_RECEIVED_BY_MANAGER",
  TASK_ASSIGNED_TO_ARTISAN:"TASK_ASSIGNED_TO_ARTISAN",
  TASK_RECEIVED_BY_ARTISAN:"TASK_RECEIVED_BY_ARTISAN",
  TASK_IN_PROGRESS:"TASK_IN_PROGRESS",
  TASK_COMPLETE_PENDING_REVIEW:"TASK_COMPLETE_PENDING_REVIEW",
  COMPLETED:"COMPLETED",
  CLOSED:"CLOSED",
  TASK_NOTIFICATION:"TASK_NOTIFICATION"
};

const FACILITY_MANAGER_ONBOARDED_TITLE = "CLOVER MANAGER ONBOARDED.";

const FACILITY_MANAGER_TO_CLIENT_ONBOARD_REQUEST_TITLE = "Clover app onboard request.";

const TASK_NOTIFICATION_TITLE = "Clover App Task Notification.";

function getFacilityManagerOnboardedMessage() {
  return "Welcome to CloverPro facility management app.\n We are excited to have you with us and can't wait to get you running." +
    "Please proceed to login using your credentials."
}

function getFacilityManagerToClientOnboardRequestMessage(clientName, managerName, notificationUrl, userType, reference) {
  return `You have been invited by: ${managerName} (Facility manager),to join as an ${userType} on the CloverPro Facility management app.\n Please visit ${notificationUrl} and use this reference: ${reference} to complete the sign up process.`
}


const getTaskStatusChangeNotificationMessgae = (name,taskName, userType, oldStatus, newStatus, reference,extraDetails) => {
  // Your 'Fix fan' task just changes status from 'old status' to 'new status'
  // Hello 'name', This is an update on your 'Fix fan' complaint just changed status from 'old status' to 'new status'

  if(newStatus === TASK_STATUS.LOGGED_SUCCESS){
    switch (userType) {

      case USER_TYPES.FACILITY_MANAGER:
        return `A task with name: ${taskName} and reference: ${reference} was just logged on the System. \nLogin to System to view more details.`;
      case USER_TYPES.OCCUPANT:
        return `Your request with name: ${taskName} and reference: ${reference} was logged successfully on the System as a task and notification sent to the Facility manager.`;
    }
  }

  if(newStatus === TASK_STATUS.CLOSED){
    return `This is an update on the '${taskName}' task with reference: ${reference}.\nIt has been closed.`
  }

  if(newStatus === TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW){
    let {artisanName} = extraDetails;
    switch (userType) {

      case USER_TYPES.FACILITY_MANAGER:
        return `The task with name: '${taskName}' and reference: ${reference} has been marked as completed by ${artisanName}, but it is awaiting your approval.\nLogin to System to view more details.`;
      case USER_TYPES.OCCUPANT:
        return `This is an update on the '${taskName}' task with reference: ${reference}.\nIt has been marked as completed by Artisan: ${artisanName} and is awaiting final approval by your facility manager.`;
      case USER_TYPES.ARTISAN:
        return `This is an update on the '${taskName}' task with reference: ${reference}.\nYou have successfully marked it as completed but is awaiting final approval by your facility manager.`
    }
  }

  if(newStatus === TASK_STATUS.ASSIGNED_TO_ARTISAN){
    let {artisanName} = extraDetails;

    if(userType === USER_TYPES.ARTISAN){

      return `You have just been assigned a task with name: ${taskName} and reference: ${reference}.\nPlease login to System to view more details.`
    }

    return `This is an update on the ${taskName} task with reference: ${reference}.\nIt has been assigned to ${artisanName}.`
  }

  if(newStatus === TASK_STATUS.COMPLETED){
    return `This is an update on the '${taskName}' task with reference: ${reference}.\n it has been marked as completed.`
  }

  return `This is an update on the '${taskName}' task with reference: ${reference}.\nIt has changed status from '${oldStatus}' to '${newStatus}'`
};


const DECREMENT = 'DECREMENT';
const INCREMENT = 'INCREMENT';
const PENDING = 'PENDING';
const cartTypes = ['customer', 'guest'];

const TASK_STATUS_CHANGE = "TASK_STATUS_CHANGE";

const EMAIL_PROVIDERS = {
  MAIL_JET:"mailJet",
  NODE_MAILER:"nodeMailer",
};

module.exports = {
  listOfCollections,
  cartTypes,
  INCREMENT,
  DECREMENT,
  PENDING,
  getFacilityManagerOnboardedMessage,
  getFacilityManagerToClientOnboardRequestMessage,
  getTaskStatusChangeNotificationMessgae,
  FACILITY_MANAGER_ONBOARDED_TITLE,
  FACILITY_MANAGER_TO_CLIENT_ONBOARD_REQUEST_TITLE,
  NOTIFICATION_STATUS,
  USER_STATUS,
  NOTIFICATION_TYPES,
  SYSTEM_STATUS,
  USER_TYPES,
  ASSET_CATEGORY,
  MAINTENABLES_TYPE,
  MAINTINABLE_STATUS,
  TASK_STATUS,
  TASK_REQUESTED_BY,
  TASK_TYPE,
  TASK_NOTIFICATION_TITLE,
  TASK_STATUS_CHANGE,
  EMAIL_PROVIDERS

};
