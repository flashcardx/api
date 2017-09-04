const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const assert = require("chai").assert;
const deckService = require("../../service/deckService");
const cardService = require("../../service/cardService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");
const setup = require("./setup");
describe("deckService", ()=>{
    describe("create update, duplicate and delete", ()=>{
       var userId;
       var parentUserDeckId;
       var cardIdUser;
       var cardIdClass;
       var parentClassDeckId;
       var classname = "testclass";
       var classId;
       var newUserDeckId;
       var newClassDeckId;

        before(done=>{
            setup.dropDatabase()
            .then(()=>{
                var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
                var userModel = new User(user);
                userId = userModel._id;
                return userModel.save();
            })
            .then(()=>{
                var c = {name:classname, descripcion:"abc", owner:userId};
                var classModel = new Class(c);
                classId = classModel._id;
                return classModel.save();
            })
            .then(()=>{
                var deck = {name:"parent user deck", description:"abc", ownerId: userId};
                var deckModel = new Deck(deck);
                parentUserDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var deck = {name:"new user deck", description:"new abc", ownerId: userId};
                var deckModel = new Deck(deck);
                newUserDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var card = {name: "test", description:"I can fly", ownerType:"u", ownerId: userId, deckId: parentUserDeckId};
                var cardModel = new Card(card);
                cardIdUser = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeckclass", description:"abc", ownerType:"c", ownerId: classId};
                var deckModel = new Deck(deck);
                parentClassDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var deck = {name:"new deck class", description:"new deck for class", ownerType:"c", ownerId: classId};
                var deckModel = new Deck(deck);
                newClassDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var card = {name: "card class", description:"I can fly in a class", ownerType:"c", ownerId: classId, deckId: parentClassDeckId};
                var cardModel = new Card(card);
                cardIdClass = cardModel._id;
                return cardModel.save();
            })
            .then(()=>{
                done();
            })
            .catch(err=>{
                logger.error("error in before method: " + err);
            })
        });

    
        it("should create user deck", done=>{
            var deck = {name:"deck1"};
            deckService.create4User(userId, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should create child deck from parent id", done=>{
            var deck = {name:"deck1", parentId:parentUserDeckId};
            deckService.create4User(userId, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should update user deck", done=>{
            var deck = {name:"update1", description:"best deck ever"};
            deckService.update4User(userId, parentUserDeckId, deck, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should update class deck", done=>{
            var deck = {name:"update2"};
            deckService.update4Class(userId, parentClassDeckId, deck, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should validate that user is in class and create deck for class", done=>{
            var deck = {name:"deck1", classname:classname};
            deckService.create4Class(userId, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should validate that user is in class and create child deck for class from parent deck", done=>{
            var deck = {name:"deck1", parentId:parentClassDeckId, classname:classname};
            deckService.create4Class(userId, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should duplicate user deck", done=>{
            logger.error("src deck: " + parentUserDeckId + ", dest deck: " + newUserDeckId);
            deckService.duplicate2User(userId, parentUserDeckId, newUserDeckId, r=>{
                setTimeout(()=>{
                    assert.equal(r.success, true);
                    done();
                }, 3000);
            });
        })

        it("should duplicate class deck", done=>{
            deckService.duplicate2Class(userId, classname, parentUserDeckId, newUserDeckId,r=>{
                assert.equal(r.success, false);
                done();
            });
        })
        
        it("should duplicate class deck", done=>{
            setTimeout(()=>{
                deckService.duplicate2Class(userId, classname, parentUserDeckId, undefined, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            }, 3000);
        })

        it("should duplicate class deck", done=>{
            deckService.duplicate2Class(userId, classname, parentUserDeckId, newClassDeckId, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should delete user deck", done=>{
            deckService.delete4User(userId, parentUserDeckId, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should delete class deck", done=>{ 
            deckService.delete4Class(userId, parentClassDeckId, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should fail when delete class deck", done=>{
            deckService.delete4Class(userId, parentUserDeckId, r=>{
                assert.equal(r.success, false);
                done();
            });
        })

    });

    describe("thumbnail", ()=>{
            var userId;
            var deckUserId;
            var deckClassId;
            var classname = "testclass";
            var classId;
            before(done=>{
                setup.dropDatabase()
                .then(()=>{
                    var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
                    var userModel = new User(user);
                    userId = userModel._id;
                    return userModel.save();
                })
                .then(()=>{
                    var c = {name:classname, descripcion:"abc", owner:userId};
                    var classModel = new Class(c);
                    classId = classModel._id;
                        return classModel.save();
                })
                .then(()=>{
                    var deck = {name:"testdeck", description:"abc", ownerId: userId};
                    var deckModel = new Deck(deck);
                    deckUserId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    var deck = {name:"testdeckclass", description:"abc", ownerId: classId};
                    var deckModel = new Deck(deck);
                    deckClassId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    done();
                })
                .catch(err=>{
                    logger.error("error in before method: " + err);
                })
            });

            it("should set thumbnail from url", done=>{
                var data = {deckId:deckUserId, url: "https://media1.popsugar-assets.com/files/thumbor/THQGVnPVyE74PzXgrHIAePE0US0/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2017/05/24/047/n/1922398/be1a9e7d710e4833_GettyImages-111194166/i/Sexy-Daddy-Yankee-Pictures.jpg"};
                deckService.setImgUserDeckFromUrl(userId, data, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            })
            
            it("should set thumbnail from url", done=>{
                var data = {deckId: deckClassId, url: "https://media1.popsugar-assets.com/files/thumbor/THQGVnPVyE74PzXgrHIAePE0US0/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2017/05/24/047/n/1922398/be1a9e7d710e4833_GettyImages-111194166/i/Sexy-Daddy-Yankee-Pictures.jpg"};
                deckService.setImgClassDeckFromUrl(userId, data, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            })
            
            it("deletes image user deck", done=>{
                deckService.deleteImgUserDeck(userId, deckUserId, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            })

            it("deletes image class deck", done=>{
                deckService.deleteImgClassDeck(userId, deckClassId, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            });

            it("set image for user deck from buffer", done=>{
                fs.readFile(appRoot+"/test/resources/test.jpg", function (err, buffer) {
                    if (err) throw err;
                    var data = {deckId: deckUserId, img: buffer};
                    deckService.setImgUserDeckFromBuffer(userId, data, r=>{
                        assert.equal(r.success, true);
                        done();
                        });
                    });
            });

            it("set image for class deck from buffer", done=>{
                fs.readFile(appRoot+"/test/resources/test2.jpg", function (err, buffer) {
                    if (err) throw err;
                    var data = {deckId: deckClassId, img: buffer};
                    deckService.setImgClassDeckFromBuffer(userId, data, r=>{
                        assert.equal(r.success, true);
                        done();
                        });
                    });
            });          
    });

    describe("Get decks", ()=>{
            var userId;
            var deckUserId;
            var childrenDeckUserId;
            var childrenDeckClassId;
            var deckClassId;
            var classname = "testclass";
            var classId;
            before(done=>{
                setup.dropDatabase()
                .then(()=>{
                    var user = {"name":"tester", password:"1234", "plan.cardsLeft":200};
                    var userModel = new User(user);
                    userId = userModel._id;
                    return userModel.save();
                })
                .then(()=>{
                    var c = {name:classname, descripcion:"abc", owner:userId};
                    var classModel = new Class(c);
                    classId = classModel._id;
                        return classModel.save();
                })
                .then(()=>{
                    var deck = {name:"children deck", description:"abc", ownerId: userId};
                    var deckModel = new Deck(deck);
                    childrenDeckUserId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    var deck = {name:"parent deck",decks:[childrenDeckUserId], description:"abc", ownerId: userId};
                    var deckModel = new Deck(deck);
                    deckUserId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    var deck = {name:"children class deck", description:"abc", ownerId: classId, ownerType:"c"};
                    var deckModel = new Deck(deck);
                    childrenDeckClassId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    var deck = {name:"parent class deck", decks:[childrenDeckClassId], description:"abc", ownerId: classId, ownerType:"c"};
                    var deckModel = new Deck(deck);
                    deckClassId = deckModel._id;
                    return deckModel.save();
                })
                .then(()=>{
                    done();
                })
                .catch(err=>{
                    logger.error("error in before method: " + err);
                })
            });

        
        it("get all user decks, should get 2 decks", done=>{
            deckService.allUserDecks(userId, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 2);
                done();
            })
        })

        it("get all class decks, should get 2 decks", done=>{
            deckService.allClassDecks(userId, classname, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 2);
                done();
            })
        })

         it("get child user decks, should get 1 deck", done=>{
            deckService.childUserDecks(userId, undefined, 1, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 1);
                done();
            })
        })

        it("get child user decks, should get 1 deck", done=>{
            deckService.childUserDecks(userId, deckUserId, 1, r=>{
                assert.equal(r.success, true);
                 assert.equal(r.msg.length, 0);
                done();
            })
        })

        it("get child class decks, should get 1 decks", done=>{
            deckService.childClassDecks(userId, undefined, classname,1, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 1);
                done();
            })
        })

        it("get child class child decks, should get 0 decks", done=>{
            deckService.childClassDecks(userId, deckClassId, classname, 4, r=>{
                assert.equal(r.success, true);
                assert.equal(r.msg.length, 0);
                done();
            })
        })

    })
});
