const appRoot = require('app-root-path');
const assert = require("chai").assert;
const searchService = require("../../service/searchService");
const mongoose = require("mongoose");
const setup = require("./setup");
var fs = require("fs");


describe("searchService", ()=>{
       
    it("text to speech", done=>{
        searchService.textToSpeech("es", "¿que estas haciendo?", r=>{
            assert(r.success, true);
            done();
        });
    })
      
});