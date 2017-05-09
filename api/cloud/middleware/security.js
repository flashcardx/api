const appRoot = require('app-root-path');
const helmet = require("helmet");
const session = require('client-sessions');
const randomstring = require("randomstring");
const User = require(appRoot + "/models/userModel");

module.exports = function(app){

    app.use(helmet());
  

}