const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
var childProcess = require(appRoot + "/child");

function genCodes(email, count, months, school){
    childProcess.genCodesAndSendEmail(email, count, months, school);
}

module.exports = {
    genCodes: genCodes
}