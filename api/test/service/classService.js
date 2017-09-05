const appRoot = require('app-root-path');
const assert = require("chai").assert;
const classService = require("../../service/class/classService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Class = require(appRoot + "/models/classModel");
const setup = require("./setup");
var fs = require("fs");


describe("classService", ()=>{
        var userId,
            userDeckId,
            classname = "my class",
            classDeckId,
            classId,
            cardIdUser,
            cardIdClass;
    
        before(done=>{
            setup.dropDatabase()
            .then(()=>{
                var user = {"name":"tester", password:"1234"};
                var userModel = new User(user);
                userId = userModel._id;
                return userModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeck", description:"abc", ownerId: userId};
                var deckModel = new Deck(deck);
                userDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var c = {name:classname, descripcion:"abc", owner:userId};
                var classModel = new Class(c);
                classId = classModel._id;
                return classModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeckclass", description:"abc", ownerId: classId, ownerType:"c"};
                var deckModel = new Deck(deck);
                classDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var card = {name: "test", description:"I can fly", ownerType:"u", ownerId: userId};
                var cardModel = new Card(card);
                cardIdUser = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: "test card class", description:"Iam a card in a class", ownerType:"c", ownerId: classId};
                var cardModel = new Card(card);
                cardIdClass = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                done();
            })
            .catch(err=>{
                console.error("error in before method(cardService): " + err);
            });
        });
        describe("duplication uc and cu", ()=>{

            it("duplicate card user to class", done=>{
                classService.duplicateCardUC(userId, cardIdUser, classDeckId, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            });

            it("duplicate card class to user", done=>{
                classService.duplicateCardCU(userId, classname, cardIdClass, userDeckId, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            });
        })

        describe("class cards", ()=>{
            it("update class card should fail" ,done=>{
                var card = {name:"updated class card", deckId: userDeckId};
                classService.updateCard(classname, userId, cardIdClass, card, r=>{
                        assert.equal(r.success, false);
                        done();
                });
            });

            it("update class card" ,done=>{
                var card = {name:"updated class card ;)", deckId: classDeckId};
                classService.updateCard(classname, userId, cardIdClass, card, r=>{
                        assert.equal(r.success, true);
                        done();
                });
            });
        })
});