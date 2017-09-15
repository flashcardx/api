const appRoot = require('app-root-path');
const helmet = require("helmet");
const session = require('client-sessions');
const randomstring = require("randomstring");
const User = require(appRoot + "/models/userModel");

module.exports = function(app){

    app.use(helmet());
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

}