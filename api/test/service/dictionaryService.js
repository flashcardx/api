const appRoot = require('app-root-path');
const assert = require("chai").assert;
const dictionaryService = require(appRoot+"/service/dictionaryService");
const cacheService = require(appRoot+"/service/cacheService");
const mongoose = require("mongoose");
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);
const setup = require("./setup");

describe("dictionaryService", ()=>{

    var USERID_1;

    before( function(done){
        this.timeout(100000);
        setup.dropDatabase()
        .then(()=>{
            var user = {name:"tester", password:"1234", "plan.cardsLeft":200};
            var userModel = new User(user);
            USERID_1 = userModel._id;
            return userModel.save();
        })
        .then(()=>{
            done();
        })
        .catch(err=>{
            logger.error("error in before: ", err);
            done(err);
        });
    });

    it("translate hello to hola should succeed", done=>{
        dictionaryService.translate(USERID_1, "hello", "en", "es", r=>{
            assert.equal(r.success, true, "success should be true");
            assert.equal(r.text, "Hola", "translation should be: Hola");
            done();
        })
    })

    it("translate hello to hola without from should succeed", done=>{
        dictionaryService.translate(USERID_1, "hello", undefined, "es", r=>{
            assert.equal(r.success, true, "success should be true");
            assert.equal(r.text, "Hola", "translation should be: Hola");
            done();
       })
    })

    it("cache last lang should not exists", done=>{
        setup.dropCache()
        .then(()=>{
            return cacheService.getTranslatorLastLangs(USERID_1)
        })
        .then(r=>{
            assert.notExists(r);
            done();
        })
        .catch(err=>{
            done(err);
        })
    })

    it("cache last lang should be created after translation", done=>{
        setup.dropCache()
        .then(()=>{
            return cacheService.getTranslatorLastLangs(USERID_1)
        })
        .then(r=>{
            assert.notExists(r);
            return new Promise((resolve, reject)=>{
                dictionaryService.translate(USERID_1, "hello", "en", "es", r=>{
                    assert.equal(r.success, true, "success should be true");
                    assert.equal(r.text, "Hola", "translation should be: Hola");
                    resolve();
                })
            })
        })
        .then(()=>{
            return cacheService.getTranslatorLastLangs(USERID_1, true) 
        })
        .then(r=>{
            var object = JSON.parse(r);
            assert.equal(object.to, "es", "to lang should be: 'es'");
            assert.equal(object.from, "en", "from lang should be 'en'");
            done();
        })
        .catch(err=>{
            done(err);
        })
    })
        
    it("define: find definition for word in english", done=>{
        dictionaryService.define("en", "hello", r=>{
            assert.equal(r.success, true);
            done();
        })
    })

    it("define: find definition for word in non available language, should fail", done=>{
        dictionaryService.define("fr", "hello", r=>{
            assert.equal(r.success, false);
            done();
        })
    })

    it("define: find definition for word in spanish", done=>{
        dictionaryService.define("es", "pito", r=>{
            console.log("result: ", r);
            assert.equal(r.success, true);
            done();
        })
    })

    
});