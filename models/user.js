const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const auditSchema = require('./auditable');
var salt = bcrypt.genSaltSync();


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
}

const validEmailChecker = (email) => {
    if (!email) {
        return false;
    } else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
}

const validPasswordChecker = (password) => {
    if (!password) {
        return false;
    } else {
        const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
        return regExp.test(password);
    }
}

const passwordLengthChecker = (password) => {
    if (!password) {
        return false;
    } else {
        if (password.length < 3 || password.length > 50) {
            return false;
        } else {
            return true;
        }
    }
}

const validPhone = (phoneNumber) => {
    if (!phoneNumber) {
        return false;
    } else {
        const regExp = new RegExp(/^\d+$/);
        return regExp.test(phoneNumber);
    }
}

const passwordValidate = [
    {
        validator: passwordLengthChecker, message: 'Password must be between 3 and 50 characters'
    },
    {
        validator: validPasswordChecker,
        message: 'Password is invalid - Password must have a lowercase, uppercase letter, a symbol and atleast a number'
    }
];
const emailValidate = [
    {
        validator: emailLengthChecker, message: 'Email must be between 3 and 50 characters'
    },
    {
        validator: validEmailChecker, message: 'Email is invalid'
    }
];

const phoneNumberValidate = [
    {
        validator: validPhone, message: 'Phone number must contain only numbers/digits'
    }
];

var customSchema = Object.assign({}, {
    email: {type: String, required: true, unique: true, validate: emailValidate},
    password: {type: String, required: true, validate: passwordValidate},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    address: {type: String},
    company: {type: String},
    userType: {type: String, required: true},
    isVerificationEmailSent: {type: Boolean},
    onBoardedBy: {type: Schema.Types.ObjectId},
    status: {type: String, required: true},
    phoneNumber: {type: String}
}, auditSchema);

const UserSchema = new Schema(customSchema);


UserSchema.pre('save', function (next) {
    if (!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, salt, (err, hash) => {
        if (err){
            console.log(err);
            next(err);
        }else{
            this.password = hash;
            next();
        }
    });
});

UserSchema.methods.comparePassword = function (password,cb) {
    bcrypt.compare(password, this.password,cb);
};

UserSchema.methods.hashPassword =function(password,cb){
    bcrypt.hash(password, salt, (err, hash) => {
        if (err){
            console.log("hashing error"+err);
            cb({success:false,error:err});
        }else{
            cb({success:true,hashedPassword:hash});
        }
    });
};

module.exports = mongoose.model('User', UserSchema);
