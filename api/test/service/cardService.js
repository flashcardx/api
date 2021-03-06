const appRoot = require('app-root-path');
const assert = require("chai").assert;
const cardService = require("../../service/cardService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");
const setup = require("./setup");

describe("cardService", ()=>{
        var userId,
            userDeckId,
            userDeckId2,
            classDeckId,
            classId,
            cardIdUser;
    
        before(done=>{
            setup.dropDatabase()
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
                var deck = {name:"testdeck2", description:"abc2", ownerId: userId};
                var deckModel = new Deck(deck);
                userDeckId2 = deckModel._id;
                return deckModel.save();
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
                done();
            })
            .catch(err=>{
                console.error("error in before method(cardService): " + err);
            });
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

    it("duplicate card user to user" ,done=>{
        cardService.duplicateCard2User(userId, cardIdUser, userDeckId, r=>{
                assert.equal(r.success, true);
                done();
        });
    });

    it("Get user cards" ,done=>{
        var parameters = {deckId: userDeckId};
        cardService.getCards(userId, parameters, r=>{
                assert.equal(r.success, true);
                assert.equal(r.cards.length, 4);
                done();
        });
    });


    it("update user card" ,done=>{
        var card = {name:"updated card", imgs:[]};
        cardService.updateCard(cardIdUser, userId, card, r=>{
                assert.equal(r.success, true);
                done();
        });
    });

    it("update user card, change deck" ,done=>{
        var card = {name:"updated card", deckId: userDeckId, imgs:[]};
        cardService.updateCard(cardIdUser, userId, card, r=>{
                assert.equal(r.success, true);
                done();
        });
    });
    
    it("move card", done=>{
        cardService.moveCard(userId, cardIdUser, userDeckId2, r=>{
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