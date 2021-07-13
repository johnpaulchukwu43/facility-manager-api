const express = require("express");

const secret = require('./config/secret');
//Set port number
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = express.Router();
var user = require('./routes/customer')(router);
var onboardRequest = require('./routes/onboardRequest')(router);
var building = require('./routes/building')(router);
var floor = require('./routes/floor')(router);
var room = require('./routes/room')(router);
var asset = require('./routes/asset')(router);
var taskRoutes = require('./routes/taskRoutes')(router);
var occupantRoutes = require('./routes/occupantRoutes')(router);
var artisanRoutes = require('./routes/artisanRoutes')(router);
var analyticsRoutes = require('./routes/analytics')(router);
let base_path = '/api/v1';

const app = express();

const port = secret.port || 5000;
//db connection
console.log(JSON.stringify(secret));

const environment = secret.nodeEnv;

if(environment === 'development'){
    mongoose.connect(secret.database, { useNewUrlParser: true }, (err)=> {
        if (err) {
            console.log(err);
        } else {
            console.log("Connected to the database");
        }
    });
}else{
    mongoose.connect(secret.database, {
        "user":secret.databaseUsername,
        "pass":secret.databasePassword,
        "authSource":secret.authDatabase
    }, (err)=> {
        if (err) {
            console.log(err);
        } else {
            console.log("Connected to the database");
        }
    });
}

//cors setup
var corsOptions = {
    origin: 'http://localhost:8000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//Middle ware
app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded( { extended: true }));


app.use(base_path,user);
app.use(base_path,onboardRequest);
app.use(base_path,building);
app.use(base_path,floor);
app.use(base_path,room);
app.use(base_path,asset);
app.use(base_path,taskRoutes);
app.use(base_path,occupantRoutes);
app.use(base_path,artisanRoutes);
app.use(base_path,analyticsRoutes);

app.listen(port, function (err) {
    if (err) throw err;
    console.log("Server is running " + port);
});
