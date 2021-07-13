import * as handlebars from "handlebars";

const secret = require('./../config/secret');

const nodeMailer = require('nodemailer');

const mailjet = require ('node-mailjet');

const constants = require("../common/constants");

import {findByIdAndUpdate} from "../dao/emailNotificationDao"
import {
  clientAppUrl,
  mailJetApiKey,
  mailJetApiSecret, nodeMailerHost,
  nodeMailerPassword, nodeMailerPort,
  nodeMailerUsername
} from "../config/secret";

const fs = require("fs");
const path = require("path");

let transporter = nodeMailer.createTransport({
  host: nodeMailerHost,
  port: nodeMailerPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: nodeMailerUsername, // generated ethereal user
    pass: nodeMailerPassword// generated ethereal password
  }
});


export const sendEmail = async (notification) => {

  let {sender, subject, senderAddress, message, _id, recipient, firstName,lastName} = notification;


  let appUrl = clientAppUrl;

  const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../assets/email-notification.html"), "utf8");

  const notificationTemplate = handlebars.compile(emailTemplateSource);

  const extractedHtml = notificationTemplate({firstName,lastName,message,appUrl});

  const mailOptions = {
    fromEmail: senderAddress,
    from: `${sender} <${senderAddress}>`, // sender address
    to: recipient, // list of receivers
    subject: subject, // Subject line// plain text body
    html: extractedHtml, // html body
    provider: secret.emailServiceProvider

  };


  try {

    let emailResponse = await callEmailProvider(mailOptions);

    let updateBody = {};

    if (emailResponse.status === constants.SYSTEM_STATUS.SUCCESS) {
      updateBody = {notificationStatus: constants.NOTIFICATION_STATUS.COMPLETED}
    } else {
      updateBody = {notificationStatus: constants.NOTIFICATION_STATUS.FAILED}
    }

    await findByIdAndUpdate(updateBody, _id);

    //todo update user column email sent to true

  } catch (e) {
    console.log(JSON.stringify(e));
    return {message: "Error updating record", status: constants.SYSTEM_STATUS.ERROR};
  }


};


const callEmailProvider = async (mailOptions) => {
  let {provider}= mailOptions;

  console.log(`using email provider: ${provider} to send mail`);

  switch (provider) {
    case constants.EMAIL_PROVIDERS.MAIL_JET:
      await sendMailUsingMailJet(mailOptions);
      break;
    default:
      await sendEmailUsingNodeMailer(mailOptions);
      break;
  }
};

const sendEmailUsingNodeMailer = async (mailOptions) =>{
  try {

    let data  = await transporter.sendMail(mailOptions);
    return {status: constants.SYSTEM_STATUS.SUCCESS, data};
  } catch (ex) {
    console.log("Error sending mail:" + JSON.stringify(ex));
    return {status: constants.SYSTEM_STATUS.ERROR, error};
  }
};



const sendMailUsingMailJet = async(mailOptions) =>{

  let {from, to, subject,fromEmail, html} = mailOptions;

  try {
    let mailJetSender = mailjet.connect(mailJetApiKey,mailJetApiSecret);

    let result = await mailJetSender.post("send", {'version': 'v3.1'})
      .request({
        "Messages":[
          {
            "From": {
              "Email": fromEmail,
              "Name": from
            },
            "To": [
              {
                "Email": to,
                "Name": to
              }
            ],
            "Subject": subject,
            // "TextPart": text,
            "HTMLPart": html,
            "CustomID": "AppGettingStartedTest"
          }
        ]
      });

    console.log(`result from mail:${JSON.stringify(result)}`);
    return {status: constants.SYSTEM_STATUS.SUCCESS, data:result};
  } catch (ex) {
    console.log("Error sending mail:" + JSON.stringify(ex));
    return {status: constants.SYSTEM_STATUS.ERROR, error};
  }



};
