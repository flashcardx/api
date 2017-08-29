require("../../app");
const appRoot = require('app-root-path');
const assert = require("chai").assert;
const classService = require("../../service/class/classService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");

/*
WARNING: THIS TEST IS READY TO BE THE ONLY ONE TO BE RUN, IF YOU WANT TO RUN THIS TEST IN CONBINATION WITH OTHERS
ALTER THE DROPDATABASE FUNCTION. IF CONNECTION IS ALREADY OPENED THIS FUNCTION WILL NEVER RESOLVE
*/

function dropDatabase(){
    return new Promise((resolve, reject)=>{
        mongoose.connection.once('connected', () => {
            mongoose.connection.db.dropDatabase();
            return resolve();
        });
    });
};

describe("classService", ()=>{
        var userId,
            userDeckId,
            classname = "my class",
            classDeckId,
            classId,
            cardIdUser,
            cardIdClass;
    
        before(done=>{
            dropDatabase()
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
                var deck = {name:"testdeckclass", description:"abc", ownerId: classId};
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

        after(done=>{
            //mongoose.connection.db.dropDatabase();
            done();
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
            it.only("update class card" ,done=>{
                var card = {name:"updated class card"};
                classService.updateCard(classname, userId, cardIdClass, card, r=>{
                        assert.equal(r.success, true);
                        done();
                });
            });

        })
});