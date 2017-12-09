const appRoot = require('app-root-path');
const assert = require("chai").assert;
const practiceService = require("../../service/practiceService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
var fs = require("fs");
const setup = require("./setup");

describe("cardService", ()=>{
        const DECK_NAME="testdeck";
        const CARD_NAME = "holy grail";
        var userId,
            cardId,
            cardId1, 
            cardId2,
            cardId3,
            cardId4,
            cardId5,
            userDeckId,
            userDeckId2;
        var testRankCardTwice = false;
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
                var deck = {name:"deck2", description:"abc2", ownerId: userId};
                var deckModel = new Deck(deck);
                userDeckId2 = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId1 = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId2 = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId3 = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId4 = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var card = {name: CARD_NAME, description:"I can fly", ownerType:"u", ownerId: userId, deckId: userDeckId};
                var cardModel = new Card(card);
                cardId5 = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                done();
            })
            .catch(err=>{
                console.error("error in before method(cardService): " + err);
            });
        });

        it("get spaced repetition practice cards", done=>{
            practiceService.listCards(userId, userDeckId, r=>{
                assert.equal(r.success, true);
                done();
            });
        });

        it("rank card twice, should fail", done=>{
            testRankCardTwice =true;
            practiceService.rankCard(userId, cardId, CARD_NAME, r=>{
                assert.equal(r.success, true);
                assert.equal(r.rank, 5);
                practiceService.rankCard(userId, cardId, CARD_NAME, r=>{
                    assert.equal(r.success, false);
                    done();
                });
            });
        });

        it("Rank 5 cards to see plus of points", done=>{
            practiceService.rankCard(userId, cardId1, CARD_NAME, r=>{
                assert.equal(r.success, true);
                assert.equal(r.rank, 5);
                assert.equal(r.points, 30);
                practiceService.rankCard(userId, cardId2, CARD_NAME, r=>{
                    assert.equal(r.success, true);
                    assert.equal(r.rank, 5);
                    assert.equal(r.points, 30);
                    practiceService.rankCard(userId, cardId3, CARD_NAME, r=>{
                        assert.equal(r.success, true);
                        assert.equal(r.rank, 5);
                        assert.equal(r.points, 30);
                        practiceService.rankCard(userId, cardId4, CARD_NAME, r=>{
                            assert.equal(r.success, true);
                            assert.equal(r.rank, 5);
                            if(!testRankCardTwice)
                                assert.equal(r.points, 30);
                            else    
                                assert.equal(r.points, 150);
                            practiceService.rankCard(userId, cardId5, CARD_NAME, r=>{
                                assert.equal(r.success, true);
                                assert.equal(r.rank, 5);
                                if(!testRankCardTwice)
                                     assert.equal(r.points, 150);
                                else    
                                    assert.equal(r.points, 30);
                                
                                done();
                            }); 
                        });
                    }); 
                });
            });
        });
})