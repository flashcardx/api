const appRoot = require('app-root-path');
const request = require('supertest');
const assert = require("chai").assert;
const app = require(appRoot +"/app");
const setup = require("./setup");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
describe("search controller", ()=>{

    var ACCESS_TOKEN;

    before(function(done){
        this.timeout(100000);
        setup.setupBasicUser()
        .then((token)=>{
            logger.info("token: ", token);
            ACCESS_TOKEN = token;
            done();
        })
        .catch(err=>{
            logger.error("error in before: ", err);
            done(err);
        })
    })

    it("translation should finish ok", done=>{
        const text = "hello",
              to="es";
        const url = "/translate?text="+text+"&to="+to;
        request(app)
        .get(url)
        .set("x-access-token", ACCESS_TOKEN)
        .expect(200)
        .then(({body})=>{
            assert.equal(body.success, true, "success should be true");
            assert.equal(body.text, "Hola", "translation should be right");
            assert.equal(body.from, "en", "from language should be autodected");
            done();
        })
        .catch(err=>{
            logger.error("error: ", err);
            done(err)
        })
    })

    it("test traslate last languages", done=>{
        const text = "hello",
              to="es";
        const url = "/translate?text="+text+"&to="+to;
        request(app)
        .get(url)
        .set("x-access-token", ACCESS_TOKEN)
        .expect(200)
        .then(()=>{
            return request(app)
                    .get("/translateUsedLangs")
                    .set("x-access-token", ACCESS_TOKEN)
                    .expect(200)
        })
        .then(({body})=>{
            const o = JSON.parse(body.msg);
            assert.equal(o.to, "es", "'to' lang should be: 'es'");
            assert.notExists(o.from);
            done();
        })
        .catch(err=>{
            logger.error("error: ", err);
            done(err);
        })
    })

})