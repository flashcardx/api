const appRoot = require('app-root-path');
const assert = require("chai").assert;
const emailService = require("../../service/emailService");
const mongoose = require("mongoose");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
var fs = require("fs");
const setup = require("./setup");


describe("emailService", ()=>{

    const TO1 = "pablo-n-m@hotmail.com",
          SUBJECT1 = "testing"
          TEXT1 = "HELLO";

    it("send a plain text email", done=>{
        emailService.sendText(TO1, SUBJECT1, TEXT1)
        .then(()=>{
            done();
        })
        .catch(err=>{
            logger.error(err);
            done(err);
        })
    })

});