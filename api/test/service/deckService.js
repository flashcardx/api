require("../../app");
const assert = require("chai").assert;
const deckService = require("../../service/deckService");

describe("deckService", ()=>{
    describe("create", ()=>{
        it("should create user deck", done=>{
            var deck = {name:"deck1"};
            deckService.create4User("5998acc27bf8524843ce8e8e", deck, r=>{
                assert.equal(r.success, true);
                assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should create child deck from parent id", done=>{
            var deck = {name:"deck1", parentid:"59991371065a2544f7c90288"};
            deckService.create4User("5998acc27bf8524843ce8e8b", deck, r=>{
                console.log("got: " + JSON.stringify(r));
                assert.equal(r.success, false);
                //assert.exists(r.id, 'id is neither `null` nor `undefined`');
                done();
            });
        })

        it("should validate that user is in class and create deck for class", done=>{
            var deck = {name:"deck1"};
            deckService.create4Class("599b1776fbf37e2d37998b54", "class2", deck, r=>{
                assert.equal(r.success, false);
                done();
            });
        })
    });

    describe.only("thumbnail", ()=>{
            it("should set thumbnail from url", done=>{
                var data = {deckId:"599b1955cd3b4433151610aa", url: "https://media1.popsugar-assets.com/files/thumbor/THQGVnPVyE74PzXgrHIAePE0US0/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2017/05/24/047/n/1922398/be1a9e7d710e4833_GettyImages-111194166/i/Sexy-Daddy-Yankee-Pictures.jpg"};
                deckService.setImageUserDeckFromUrl("5998acc27bf8524843ce8e8e", data, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            }).timeout(5000); //increases timeout since img download is very slow

            it("should set thumbnail from url", done=>{
                var data = {classname:"class1", deckId:"599b18115ef377305a7fb3ba", url: "https://media1.popsugar-assets.com/files/thumbor/THQGVnPVyE74PzXgrHIAePE0US0/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2017/05/24/047/n/1922398/be1a9e7d710e4833_GettyImages-111194166/i/Sexy-Daddy-Yankee-Pictures.jpg"};
                deckService.setImageClassDeckFromUrl("5998acc27bf8524843ce8e8e", data, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            }).timeout(5000); //increases timeout since img download is very slow

            it.only("deletes user deck thumbnail", done=>{
                deckService.deleteImageUserDeck("5998acc27bf8524843ce8e8e", "599b1955cd3b4433151610aa", r=>{
                    assert.equal(r.success, true);
                    done();
                });
            }).timeout(500000);
    });
})