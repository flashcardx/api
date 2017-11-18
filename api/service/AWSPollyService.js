const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const credentials = config.AWSCredentials;
var AWS = require('aws-sdk');
const _ = require("lodash");
const Stream = require('stream')
const Speaker = require('speaker')
AWS.config = new AWS.Config();
AWS.config.accessKeyId = credentials.accessKeyId;
AWS.config.secretAccessKey = credentials.secretAccessKey;
AWS.config.region = credentials.region;
if(env==="production"){
    AWS.config.update({
        useAccelerateEndpoint: true
    });
}

const Polly = new AWS.Polly();

var getPlayer = function() {
    return new Speaker({
        channels: 2,
        bitDepth: 24,
        sampleRate: 48000
    });
}

function playSound(text){
    let params = {
        OutputFormat: "pcm", 
        Text: text, 
        VoiceId: "Joanna"
    }
    
    Polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.log("err" + err.code)
        } else if (data) {
            if (data.AudioStream instanceof Buffer) {
                // Initiate the source
                var bufferStream = new Stream.PassThrough()
                // convert AudioStream into a readable stream
                bufferStream.end(data.AudioStream);
                // Pipe into Player
                bufferStream.pipe(getPlayer());
            }
        }
    })
}

module.exports = {
    playSound: playSound,
}
