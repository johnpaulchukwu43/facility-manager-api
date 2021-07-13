/*
 Created by Johnpaul Chukwu @ $
*/
const jwt = require('jsonwebtoken');

import _ from "lodash"

const config = require('../config/secret');


function appendToObject(field,object){
    return Object.assign({},field ,object);
}

function isString(x) {
    return Object.prototype.toString.call(x) === '[object String]';
}

function isArray(x) {
    return Array.isArray(x);
}

const isNotEmpty = (item) => {
  return ! _.isEmpty(item);
};

const isEmpty = (item) => {
  return _.isEmpty(item);
};


function genRef() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const isContainedInObject = (object, expectedValue) => {

  if(isEmpty(expectedValue)) return false;

  let values = Object.values(object);

  let result = values.filter(value => value === expectedValue);

  return  result.length !== 0
};

const tokenChecker = function (req, res, next) {
  var token = req.headers['authorization'];
  if (!token){
    res.status(400).json({ success: false, message: 'No token provided' });
  } else {
    token = token.replace(/^Bearer\s/, '');
    jwt.verify(token, config.secretKey, function(err, decoded) {
      if (err) {
        res.status(400).json({ success: false, message: 'token invalid: ' +err });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

const emailLengthChecker = (email) => {
  if (!email) {
    return false;
  } else {
    if (email.length < 3 || email.length > 50) {
      return false;
    } else {
      return true;
    }
  }
};

const validEmailChecker = (email) => {
  if (!email) {
    return false;
  } else {
    const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regExp.test(email);
  }
}

const emailValidate = [
  {
    validator: emailLengthChecker, message: 'Email must be between 3 and 50 characters'
  },
  {
    validator: validEmailChecker, message: 'Email is invalid'
  }
];


module.exports = {
    appendToObject,
    isString,
    isArray,
    genRef,
  tokenChecker,
  emailValidate,
  isEmpty,
  isNotEmpty,
  isContainedInObject
};


