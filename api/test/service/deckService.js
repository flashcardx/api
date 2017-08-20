require("../../app");
const assert = require("chai").assert;
const deckService = require("../../service/deckService");

describe("deckService", ()=>{
    describe("create", ()=>{
        it("should create deck and return true", done=>{
            var deck = {name:"deck1"};
            deckService.create4User("5998acc27bf8524843ce8e8e", deck, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("should create child deck from parent id", done=>{
            var deck = {name:"deck1", parentid:"599912cc885c08445e038bcf"};
            deckService.create4User("5998acc27bf8524843ce8e8e", deck, r=>{
                assert.equal(r.success, false);
                done();
            });
        })
    });
})