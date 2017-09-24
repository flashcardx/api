const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const assert = require("chai").assert;
const imgService = require("../../service/imgService");
const mongoose = require("mongoose");
const Deck = require(appRoot + "/models/deckModel").deck;
const User = require(appRoot + "/models/userModel");
const Card = require(appRoot + "/models/cardModel");
const Class = require(appRoot + "/models/classModel");
var fs = require("fs");
const setup = require("./setup");

describe.only("img service", ()=>{

        before(done=>{
            setup.dropDatabase()
            .then(()=>{
                done();
            })
            .catch(err=>{
                logger.error("error in before method: " + err);
            });
        })

    describe("img proxy", ()=>{

        const url = "https://i.amz.mshcdn.com/fNOUrTIqJ1iIWwkE_7a6Vh2zlJ4=/1200x627/2014%2F04%2F14%2F77%2FLarryPage.j.d4642.jpg";
        it("proxy from url", done=>{
            imgService.proxyFromUrl(url, r=>{
                assert.equal(r.success, true);
                done();
            });
        })

        it("proxy from buffer", done=>{
            fs.readFile(appRoot+"/test/resources/test.jpg", (err, buffer)=>{
                if (err) throw err; 
                imgService.proxyFromBuffer(buffer, r=>{
                    assert.equal(r.success, true);
                    done();
                });
            });
        })

    })
});