const appRoot = require('app-root-path');
const assert = require("chai").assert;
const dictionaryService = require(appRoot+"/service/dictionaryService");
const mongoose = require("mongoose");
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);
const setup = require("./setup");

describe("dictionaryService", ()=>{

    var USERID_1;

    before(done=>{
        setup.dropDatabase()
        .then(()=>{
            var user = {name:"tester", password:"1234", "plan.cardsLeft":200};
            var userModel = new User(user);
            USERID_1 = userModel._id;
            return userModel.save();
        })
        .then(()=>{
            done();
        })
        .catch(err=>{
            logger.error("error in before: ", err);
            done(err);
        });
    });

    it("translate hello to hola should succeed", done=>{
        dictionaryService.translate(USERID_1, "hello", "en", "es", r=>{
            assert.equal(r.success, true, "success should be true");
            done();
        })
    })

    it("translate hello to hola without from should succeed", done=>{
        dictionaryService.translate(USERID_1, "hello", undefined, "es", r=>{
            logger.info("got: ", r);
            assert.equal(r.success, true, "success should be true");
            done();
        })
    })

});