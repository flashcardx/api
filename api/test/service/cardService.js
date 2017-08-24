const appRoot = require('app-root-path');
const assert = require("chai").assert;
const cardService = require("../../service/cardService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel");
const User = require(appRoot + "/models/userModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");

function dropDatabase(){
    return new Promise((resolve, reject)=>{
        setTimeout(function() {
             mongoose.connection.db.dropDatabase();
             resolve();
        }, 2000);
    });
};

describe.only("cardService", ()=>{
        var userId;
        var userDeckId;

        before(done=>{
            dropDatabase()
            .then(()=>{
                var user = {"name":"tester", password:"1234"};
                var userModel = new User(user);
                userId = userModel._id;
                userModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeck", description:"abc", ownerId: userId};
                var deckModel = new Deck(deck);
                userDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                done();
            })
              .catch(err=>{
                console.error("error in before method(cardService): " + err);
            });
        });

        after(done=>{
            //mongoose.connection.db.dropDatabase();
            done();
        });

    it("create user card", done=>{
        var card = {name:"test"};
        var parameters = {
            card: card,
            userId: userId,
            deckId: userDeckId
        };
        cardService.createUserCard(parameters, r=>{
            console.error("result: " + JSON.stringify(r));
            assert.equal(r.success, true);
        });
    });


});