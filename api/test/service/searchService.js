const appRoot = require('app-root-path');
const assert = require("chai").assert;
const searchService = require("../../service/searchService");
const mongoose = require("mongoose");
const setup = require("./setup");
var fs = require("fs");


describe("searchService", ()=>{
       
    it("text to speech", done=>{
        console.log("esto es un perreo de esos que te vuelve loca");
        searchService.textToSpeech("es", "¿que estas haciendo?", r=>{
            assert(r.success, true);
            done();
        });
    })
      
});