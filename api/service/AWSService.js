const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const credentials = config.AWSCredentials;
const Polly = require(appRoot + "/models/imgModel");
var AWS = require('aws-sdk');
const _ = require("lodash");
const cacheService = require("./cacheService");
const md5 = require("md5");
AWS.config = new AWS.Config();
AWS.config.accessKeyId = credentials.accessKeyId;
AWS.config.secretAccessKey = credentials.secretAccessKey;
AWS.config.region = credentials.region;
if(env==="production"){
    AWS.config.update({
        useAccelerateEndpoint: true
    });
}
var s3 = new AWS.S3();
var bucketName = credentials.bucketName;

function saveToS3(key, contentType, data, callback, type){
    key = generateKey(key, type);
    var params = {Bucket: bucketName,
                  Key: key,
                  Body: data,
                  ContentType: contentType,
                  CacheControl: 'public, max-age=5184000'};
    s3.upload(params, callback);
}

//IMAGES FROM CLOUD FRONT
function addTemporaryUrl(cards, callback){
    if(cards.length === 0)
        return callback({success:true, msg:[]});
    var expireAfter = 600; //url expires after 600 seconds
    cards.forEach((card, i)=>{
        cards[i] = replaceUrl(cards[i]);
    });
    return callback({success:true, cards: cards});
}


function removeFromS3(hash, callback, type){
    const key = generateKey(hash, type);
    var bucketParams = {Bucket: bucketName, Key: key};
    s3.deleteObject(bucketParams, function(err, data) {
        if (err){
            logger.error("error when removing image from s3: " + err);   
            return callback({success:false, msg:err});
        }
        return callback({success:true});
        });
};

function replaceUrl(Kard){
    var card = _.clone(Kard);
    card.imgs = card.imgs.map(img=>{
        return {width: img.width,
                height: img.height,
                hash: img.hash,
                src: getUrl(img.hash)
            }
    });
    return card;
}

function getUrl(key, type){
    if(!key)
        return undefined;
    key = generateKey(key, type);
    return credentials.cloudfrontUrl + key;
}

function generateKey(hash, type){
    console.log(type);
    switch (type) {
        case "thumbnail":
            return "thumbnails/"+hash;
        case "audio":
            return "audios/"+hash;
        default:
            return "images/"+hash;
    }
}

//aws polly
const AWSPolly = new AWS.Polly();

function savePollyFromBuffer(hash,buffer,contentType,type,lang,words){
        saveToS3(hash, contentType, buffer, err=>{
            if(err)
                return logger.error("cant save polly: " + err);
            cacheService.putPollyResults(lang,words,hash);
            return hash;
        }, type);
}


function playSound(lang, words,callback){
    let params = {
        OutputFormat: "mp3",
        Text: words, 
        VoiceId: "Salli"
    }
    AWSPolly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            logger.error("Failed to process text to speech: " + err.code);
        } else {
            if(data){
                if (data.AudioStream instanceof Buffer) {
                    var hash = md5(data.AudioStream);
                    savePollyFromBuffer(hash,data.AudioStream,'mp3','audio',lang,words);
                    return callback({success:true, hash:hash, src: getUrl(hash,'audio')});
                }
            }
            // // Initiate the source
            // var bufferStream = new Stream.PassThrough()
            // // convert AudioStream into a readable stream
            // bufferStream.end(data.AudioStream);
            // // Pipe into Player
            // bufferStream.pipe(getPlayer());
        }
    })
}

module.exports = {
    saveToS3: saveToS3,
    removeFromS3: removeFromS3,
    addTemporaryUrl: addTemporaryUrl,
    replaceUrl: replaceUrl,
    getUrl: getUrl,
    playSound: playSound
}

