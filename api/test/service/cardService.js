require("../../app");
const appRoot = require('app-root-path');
const assert = require("chai").assert;
const cardService = require("../../service/cardService");
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

describe("cardService", ()=>{
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
                var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
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
                var card = {name: "test", description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardIdUser = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: "card class", description:"I can fly in a class", ownerType:"c", ownerId: classId, deckId: classDeckId};
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

    it("create user card", done=>{
        var card = {name:"test"};
        var parameters = {
            card: card,
            userId: userId,
            deckId: userDeckId
        };
        cardService.createUserCard(parameters, r=>{
            assert.equal(r.success, true);
            done();
        });
    });

    it("create user card again", done=>{
        var card = {name:"test2"};
        var parameters = {
            card: card,
            userId: userId,
            deckId: userDeckId
        };
        cardService.createUserCard(parameters, r=>{
            assert.equal(r.success, true);
            done();
        });
    });

    it("create class card", done=>{
        var card = {name:"test2"};
        var parameters = {
            card: card,
            userId: userId,
            deckId: classDeckId
        };
        cardService.createClassCard(parameters, classname, r=>{
            assert.equal(r.success, true);
            done();
        });
    });

    it("duplicate card user to user" ,done=>{
        cardService.duplicateCardUU(userId, cardIdUser, userDeckId, r=>{
                assert.equal(r.success, true);
                done();
        });
    });

    it("Get user cards" ,done=>{
        var parameters = {deckId: userDeckId};
        cardService.getCards(userId, parameters, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 3);
                done();
        });
    });

    it("Get class cards" ,done=>{
        var parameters = {deckId: classDeckId};
        cardService.getClassCardsUnsafe(classId, parameters, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 2);
                done();
        });
    });

    it("update user card" ,done=>{
        var card = {name:"updated card"};
        cardService.updateCard(cardIdUser, userId, card, r=>{
                assert.equal(r.success, true);
                done();
        });
    });

     it("update user card, change deck" ,done=>{
        var card = {name:"updated card", deckId: classDeckId};
        cardService.updateCard(cardIdUser, userId, card, r=>{
                assert.equal(r.success, false);
                done();
        });
    });

    it("update user card, change deck" ,done=>{
        var card = {name:"updated card", deckId: userDeckId};
        cardService.updateCard(cardIdUser, userId, card, r=>{
                assert.equal(r.success, true);
                done();
        });
    });

    it("delete card" ,done=>{
        cardService.deleteCard(cardIdUser, userId, r=>{
                assert.equal(r.success, true);
                done();
        });
    });


});