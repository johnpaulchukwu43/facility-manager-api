import {sendEmail} from "../service/emailNotificationService";
import {NOTIFICATION_TYPES,TASK_STATUS_CHANGE} from "../common/constants";


const EventEmitter = require('events');

class Emitter extends EventEmitter {


  static broadcastOnboardedAction(data){
    eventEmitter.emit(NOTIFICATION_TYPES.MANAGER_ONBOARDED, data);
  }

  static broadcastManagerToClientOnboardRequestAction(data){
    eventEmitter.emit(NOTIFICATION_TYPES.MANAGER_TO_CLIENT_ONBOARD_REQUEST, data);
  }

  static broadcastStatusChange(req,res){
    eventEmitter.emit(TASK_STATUS_CHANGE, req,res);
  }

  static broadcastTaskNotificationRequest(data){
    eventEmitter.emit(NOTIFICATION_TYPES.TASK_NOTIFICATION, data);
  }
}

const eventEmitter = new Emitter();

eventEmitter.on('event', () => {
  console.log('event emitted!');
});



eventEmitter.on(NOTIFICATION_TYPES.MANAGER_ONBOARDED, (data) =>{

  let {reference} = data;
  console.log("received event for:"+NOTIFICATION_TYPES.MANAGER_ONBOARDED+"with ref:"+reference);
  setImmediate(() => {
    console.log("sending notification here..");
    sendEmail(data);
  });
});

eventEmitter.on(NOTIFICATION_TYPES.TASK_NOTIFICATION, (data) =>{

  let {subject, recipient} = data;
  console.log(`received event for:${NOTIFICATION_TYPES.TASK_NOTIFICATION} with subject:${subject} to ${recipient}`);
  setImmediate(() => {
    console.log("sending task notification here..");
    sendEmail(data);
  });
});


eventEmitter.on(NOTIFICATION_TYPES.MANAGER_TO_CLIENT_ONBOARD_REQUEST, (data) =>{

  let {reference} = data;
  console.log("received event for:"+NOTIFICATION_TYPES.MANAGER_TO_CLIENT_ONBOARD_REQUEST+"with ref:"+reference);
  setImmediate(() => {
    console.log("sending notification here..");
    sendEmail(data);
  });
});

eventEmitter.on(TASK_STATUS_CHANGE, (req,res) =>{
  console.log(`received event for: ${TASK_STATUS_CHANGE}`);

});

export default Emitter;
