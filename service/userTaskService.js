import userDao from "../dao/userDao";
import {SYSTEM_STATUS, TASK_STATUS,USER_TYPES,NOTIFICATION_TYPES} from "../common/constants";
import {isNotEmpty} from "../common/util";

const emailNotificationDao = require('../dao/emailNotificationDao');

export const processTaskNotificationChange = async (req, res, shouldReturnHttpResponse) =>{

  try{
    let {newStatus,oldStatus} = req;
    let {facilityManagerId,occupantId,artisanId,name, taskReference} = req.task;

    let {status,message, data} = await userDao.findAll({'_id':{$in: [facilityManagerId,occupantId,artisanId]}}, { sortBy: 'createdAt', order: 'DESC', pageNum: 1, pageSize: 3 });

    console.log("data here during process"+JSON.stringify(data));

    if(status !== SYSTEM_STATUS.SUCCESS) {
      console.log(message);
      return res.json({status: SYSTEM_STATUS.ERROR, message: "Update status failed. could not retrieve users assigned to task."});
    }

    let occupant;
    let occupantFirstName;
    let occupantLastName;
    let occupantEmail;

    if(isNotEmpty(occupantId)){
       occupant = extractOccupantInfo(data,res);
       occupantFirstName = occupant.firstname;
       occupantLastName = occupant.lastname;
       occupantEmail = occupant.email;
    }



    switch (newStatus) {

      case TASK_STATUS.LOGGED_SUCCESS:
        let fmi = extractFacilityManagerInfo(data, res);

        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_LOGGED_SUCCESS,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        await createTaskStatusChangeNotification(fmi.firstname,fmi.lastname, NOTIFICATION_TYPES.TASK_LOGGED_SUCCESS,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fmi.email,taskReference,{},res);

        if(isNotEmpty(artisanId)){
          //if a task was created with an artisan assigned.
          let ari = extractArtisanInfo(data, res);
          await createTaskStatusChangeNotification(ari.firstname,ari.lastname, NOTIFICATION_TYPES.ASSIGNED_TO_ARTISAN,name,USER_TYPES.ARTISAN,oldStatus,newStatus,ari.email,taskReference,{},res);
        }
        break;

      case TASK_STATUS.RECEIVED_BY_MANAGER:
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_RECEIVED_BY_MANAGER,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        break;

      case TASK_STATUS.ASSIGNED_TO_ARTISAN:
        let facilityManager = extractFacilityManagerInfo(data, res);
        let artisan = extractArtisanInfo(data, res);
        let artisanName = `${artisan.firstname} ${artisan.lastname}`;
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_RECEIVED_BY_MANAGER,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{artisanName},res);
        }
        await createTaskStatusChangeNotification(facilityManager.firstname,facilityManager.lastname, NOTIFICATION_TYPES.TASK_RECEIVED_BY_MANAGER,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,facilityManager.email,taskReference,{artisanName},res);
        await createTaskStatusChangeNotification(artisan.firstname,artisan.lastname, NOTIFICATION_TYPES.TASK_RECEIVED_BY_MANAGER,name,USER_TYPES.ARTISAN,oldStatus,newStatus,artisan.email,taskReference,{artisanName},res);
        break;

      case TASK_STATUS.RECEIVED_BY_ARTISAN:
        let fm = extractFacilityManagerInfo(data, res);
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_RECEIVED_BY_ARTISAN,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        await createTaskStatusChangeNotification(fm.firstname,fm.lastname, NOTIFICATION_TYPES.TASK_RECEIVED_BY_ARTISAN,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fm.email,taskReference,{},res);
        break;


      case TASK_STATUS.TASK_IN_PROGRESS:
        let fm2 = extractFacilityManagerInfo(data, res);
        let ar2 = extractArtisanInfo(data, res);
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_IN_PROGRESS,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        await createTaskStatusChangeNotification(fm2.firstname,fm2.lastname, NOTIFICATION_TYPES.TASK_IN_PROGRESS,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fm2.email,taskReference,{},res);
        await createTaskStatusChangeNotification(ar2.firstname,ar2.lastname, NOTIFICATION_TYPES.TASK_IN_PROGRESS,name,USER_TYPES.ARTISAN,oldStatus,newStatus,ar2.email,taskReference,{},res);
        break;

      case TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW:
        let fm3 = extractFacilityManagerInfo(data, res);
        let ar3 = extractArtisanInfo(data, res);
        let artisanName3 = `${ar3.firstname} ${ar3.lastname}`;
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.TASK_COMPLETE_PENDING_REVIEW,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{artisanName3},res);
        }
        await createTaskStatusChangeNotification(fm3.firstname,fm3.lastname, NOTIFICATION_TYPES.TASK_COMPLETE_PENDING_REVIEW,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fm3.email,taskReference,{artisanName3},res);
        await createTaskStatusChangeNotification(ar3.firstname,ar3.lastname, NOTIFICATION_TYPES.TASK_COMPLETE_PENDING_REVIEW,name,USER_TYPES.ARTISAN,oldStatus,newStatus,ar3.email,taskReference,{artisanName3},res);
        break;

      case TASK_STATUS.COMPLETED:
        let fm4 = extractFacilityManagerInfo(data, res);
        let ar4 = extractArtisanInfo(data, res);
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.COMPLETED,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        await createTaskStatusChangeNotification(fm4.firstname,fm4.lastname, NOTIFICATION_TYPES.COMPLETED,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fm4.email,taskReference,{},res);
        await createTaskStatusChangeNotification(ar4.firstname,ar4.lastname, NOTIFICATION_TYPES.COMPLETED,name,USER_TYPES.ARTISAN,oldStatus,newStatus,ar4.email,taskReference,{},res);
        break;

      case TASK_STATUS.CLOSED:
        let fm5 = extractFacilityManagerInfo(data, res);
        let ar5 = extractArtisanInfo(data, res);
        if(isNotEmpty(occupantId)){
          await createTaskStatusChangeNotification(occupantFirstName,occupantLastName, NOTIFICATION_TYPES.CLOSED,name,USER_TYPES.OCCUPANT,oldStatus,newStatus,occupantEmail,taskReference,{},res);
        }
        await createTaskStatusChangeNotification(fm5.firstname,fm5.lastname, NOTIFICATION_TYPES.CLOSED,name,USER_TYPES.FACILITY_MANAGER,oldStatus,newStatus,fm5.email,taskReference,{},res);
        await createTaskStatusChangeNotification(ar5.firstname,ar5.lastname, NOTIFICATION_TYPES.CLOSED,name,USER_TYPES.ARTISAN,oldStatus,newStatus,ar5.email,taskReference,{},res);
        break;
    }
    if(shouldReturnHttpResponse) return res.status(200).json({status: SYSTEM_STATUS.SUCCESS, message: "status change complete"});
  }catch(ex){
    console.error(ex);
    if(shouldReturnHttpResponse) return res.status(500).json({status: SYSTEM_STATUS.ERROR, message: ex});
  }
};


async function createTaskStatusChangeNotification(firstname,lastname,notificationType,taskName,userType,oldStatus,newStatus,recipientEmail,taskReference,extraDetails, res) {
  let request = {
    notificationType,
    name: `${firstname} ${lastname}`,
    taskName: taskName,
    userType,
    oldStatus,
    newStatus,
    recipientEmail,
    taskReference,
    extraDetails,
    firstName: firstname,
    lastName: lastname,
  };

  await emailNotificationDao.createTaskStatusChangeNotification(request, res);
}



const extractOccupantInfo = (users,res) =>{

  let occupantResult = users.filter(user=> user.userType === USER_TYPES.OCCUPANT);

  if(occupantResult.length === 0) return res.json({status: SYSTEM_STATUS.ERROR, message: "Update status failed. could not retrieve occupant associated to task."});

  return occupantResult[0];
};

const extractFacilityManagerInfo = (users,res) =>{

  let facilityManagerResult = users.filter(user=> user.userType === USER_TYPES.FACILITY_MANAGER);

  if(facilityManagerResult.length === 0) return res.json({status: SYSTEM_STATUS.ERROR, message: "Update status failed. could not retrieve facilityManager owner of task."});

  return facilityManagerResult[0];
};

const extractArtisanInfo = (users,res) =>{

  let artisanInfo = users.filter(user=> user.userType === USER_TYPES.ARTISAN);

  if(artisanInfo.length === 0) return res.json({status: SYSTEM_STATUS.ERROR, message: "Update status failed. could not retrieve artisan assigned to task."});

  return artisanInfo[0];
};
