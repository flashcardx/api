const appRoot = require('app-root-path');
const request = require('supertest');
const assert = require("chai").assert;
const app = require(appRoot +"/app");
const setup = require("./setup");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
logger.info("app: ", app);
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
        logger.info("access token: ", ACCESS_TOKEN);
        request(app)
        .get(url)
        .set("x-access-token", ACCESS_TOKEN)
        .expect(200)
        .then(({body})=>{
            logger.info("body: ", body);
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



})