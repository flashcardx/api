const appRoot = require('app-root-path');
const assert = require("chai").assert;
const codeService = require("../../service/codeService");
const mongoose = require("mongoose");
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Code = require(appRoot + "/models/codeModel");
const logger = config.getLogger(__filename);
var fs = require("fs");
const setup = require("./setup");


describe("codeService", ()=>{

    const HASH1 = "0123456789",
          HASH2 = "A123456789",
          HASH3 = "DE5D4E5JD4E",
          SCHOOL1 = undefined,
          MONTHS1 = 3; 

    before(function(done){
        this.timeout(100000);
        setup.dropDatabase()
        .then(()=>{
            var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
            var userModel = new User(user);
            userId1 = userModel._id;
            return userModel.save();
        })
        .then(()=>{
            var code = {hash:HASH3, months:1};
            var codeModel = new Code(code);
            return codeModel.save()
        })
        .then(()=>{
            done();
        })
        .catch(err=>{
            console.error("error in before method(codeService): ", err);
            done( new Error(err));
        });
    });

    it("insert code", done=>{
        codeService.save(HASH1, MONTHS1, SCHOOL1)
        .then(()=>{
            done();
        })
        .catch(err=>{
            logger.error(err);
            done(err);
        })
    })

    it("insert same code twice should fail", done=>{
        var firstStep = false;
        codeService.save(HASH2, MONTHS1, SCHOOL1)
        .then(()=>{
            firstStep = true;
            return codeService.save(HASH2, MONTHS1, SCHOOL1)
        })
        .then(()=>{
            done("should not get here");
        })
        .catch(err=>{
            if(!firstStep)
                done("first call should not have failed: ", err);
            done();
        })
    })

    it("link code with user", done=>{
        codeService.linkUser(userId1, HASH3)
        .then(time=>{
            console.log("time: ", time);
            done();
        })
        .catch(err=>{
            console.error("err: ", err);
            done( new Error(err));
        });
    })
});