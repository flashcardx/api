const appRoot = require('app-root-path');
const assert = require("chai").assert;
const deckService = require("../../service/deckService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
var fs = require("fs");
const setup = require("./setup");

describe("cardService", ()=>{
        const DECK_NAME="testdeck";
        var userId,
            userDeckId,
            userChildrenDeckId;

        before(done=>{
            setup.dropDatabase()
            .then(()=>{
                var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
                var userModel = new User(user);
                userId = userModel._id;
                return userModel.save();
            })
            .then(()=>{
                var deck = {name:DECK_NAME, description:"abc", ownerId: userId};
                var deckModel = new Deck(deck);
                userDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var deck = {name:DECK_NAME, description:"abc", ownerId: userId, parentId: userDeckId};
                var deckModel = new Deck(deck);
                userChildrenDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                done();
            })
            .catch(err=>{
                console.error("error in before method(cardService): " + err);
            });
        });

        it("get only deck name", done=>{
            deckService.findByIdLean(userId, userDeckId, "name")
            .then(r=>{
                assert.equal(r.name, DECK_NAME);
                assert.notProperty(r, "description");
                done();
            })
            .catch(err=>{
                done(new Error(err));
            });
        });

        it("getAllDescendantIds", done=>{
            deckService.getAllDescendantIds()
            .then(r=>{
                console.log("got: ", r);
                console.log("userdeckid: ", userDeckId.toString());
                console.log("userChildrenDeckId: ", userChildrenDeckId.toString());
                assert.isArray(r, "should be an array with deck ids");
                assert.equal(r[1], userChildrenDeckId.toString(), "id of children should be the same");
                done();
            })
            .catch(err=>{
                done(err);
            })
        })

})