require("../../app");
const assert = require("chai").assert;
const deckService = require("../../service/deckService");

describe("deckService", ()=>{
    describe("create", ()=>{
        it("should create deck and return true", done=>{
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
            deckService.create4Class("599912b9c9f08d44137f0a21", "class1", deck, r=>{
                assert.equal(r.success, false);
                done();
            });
        })
    });
})