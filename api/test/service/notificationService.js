const appRoot = require('app-root-path');
const assert = require("chai").assert;
const notificationService = require("../../service/notificationService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const setup = require("./setup");
var fs = require("fs");

describe("Notification service",()=>{
    var userId;

    before(done=>{
         setup.dropDatabase()
        .then(()=>{
                //you can login with the pablo marino's facebook
                var user = {"name":"tester", "facebook.id":"1405698249521193", "plan.cardsLeft":200};
                var userModel = new User(user);
                userId = userModel._id;
                return userModel.save();
        })
        .then(()=>{
            done();
        })
        .catch(err=>{
            logger.error("error in before method: " + err);
        });
    });

    it("send low prioriy notif", done=>{
        for(var i=0; i<10; i++)
            notificationService.notifyUser("testing msg"+i, userId);        
        setTimeout(function() {
            //we need this to delay end of test, so give the function time to finish
            assert.equal(true, true);
            done();
        }, 10000);
    })

})