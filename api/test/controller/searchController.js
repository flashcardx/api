const appRoot = require('app-root-path');
const request = require('supertest');
const app = require(appRoot +"/app");
const setup = require("./setup");
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
describe("search controller", ()=>{

    var ACCESS_TOKEN;

    before(function(done){
        this.timeout(100000);
        setup.setupBasicUser()
        .then(token=>{
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
        done();
    })



})