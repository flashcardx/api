require("../../app");
const appRoot = require('app-root-path');
const assert = require("chai").assert;
const deckService = require("../../service/deckService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel");
const User = require(appRoot + "/models/userModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");
describe("deckService", ()=>{
    describe("create", ()=>{
       var userId;
       var parentUserDeckId;
       var parentClassDeckId;
       var classname = "testclass";
       var classId;

        before(done=>{
            mongoose.connection.db.dropDatabase();
            var user = {"name":"tester", password:"1234"};
            var userModel = new User(user);
            userId = userModel._id;
            userModel.save()
            .then(()=>{
                var c = {name:classname, descripcion:"abc", owner:userId};
                var classModel = new Class(c);
                classId = classModel._id;
                return classModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeck", description:"abc", ownerId: userId};
                var deckModel = new Deck(deck);
                parentUserDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                var deck = {name:"testdeckclass", description:"abc", ownerId: classId};
                var deckModel = new Deck(deck);
                parentClassDeckId = deckModel._id;
                return deckModel.save();
            })
            .then(()=>{
                done();
            })
            .catch(err=>{
                logger.error("error in before method: " + err);
            })
        });

        after(done=>{
            mongoose.connection.db.dropDatabase();
            done();
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

        it("should validate that user is in class and create deck for class", done=>{
            var deck = {name:"deck1"};
            deckService.create4Class(userId, classname, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should validate that user is in class and create child deck for class from parent deck", done=>{
            var deck = {name:"deck1", parentId:parentClassDeckId};
            deckService.create4Class(userId, classname, deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
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
                mongoose.connection.db.dropDatabase();
                var user = {"name":"tester", password:"1234"};
                var userModel = new User(user);
                userId = userModel._id;
                userModel.save()
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

            after(done=>{
                mongoose.connection.db.dropDatabase();
                done();
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

             it("set image for user deck from buffer again so we test if replace works ok", done=>{
                fs.readFile(appRoot+"/test/resources/test.jpg", function (err, buffer) {
                    if (err) throw err;
                    var data = {deckId: deckUserId, img: buffer};
                    deckService.setImgUserDeckFromBuffer(userId, data, r=>{
                        assert.equal(r.success, true);
                        done();
                        });
                    });
            });
            it("set image for user deck from buffer again so we test if replace works ok", done=>{
                fs.readFile(appRoot+"/test/resources/test.jpg", function (err, buffer) {
                    if (err) throw err;
                    var data = {deckId: deckClassId, img: buffer};
                    deckService.setImgClassDeckFromBuffer(userId, data, r=>{
                        assert.equal(r.success, true);
                        done();
                        });
                    });
            });
    });
});