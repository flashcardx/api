const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const credentials = config.AWSCredentials;
var AWS = require('aws-sdk');
const _ = require("lodash");
AWS.config = new AWS.Config();
AWS.config.accessKeyId = credentials.accessKeyId;
AWS.config.secretAccessKey = credentials.secretAccessKey;
AWS.config.region = credentials.region;
const langCodes = config.lang;
if(env==="production"){
    AWS.config.update({
        useAccelerateEndpoint: true
    });
}
var bucketName = credentials.bucketName;
var s3 = new AWS.S3();
const polly = new AWS.Polly();

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
        return callback({success:true, cards:[]});
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
    return credentials.cloudfrontUrl + encodeURIComponent(key);
}

function generateKey(hash, type){
    switch (type) {
        case "thumbnail":
            return "thumbnail/"+hash;
        case "audio":
            return "audio/"+ hash;
        default:
            return "image/"+hash;
    }
}

function chooseLanguageActor(lang){
    for(var i=0; i<langCodes.length; i++)
        if(langCodes[i].code === lang)
            return langCodes[i].voice;
    logger.warn("chooseLanguageActor got lang code invalid: ", lang);
    return langCodes[0].voice;
}

function textToSpeech(lang, text){
    return new Promise((resolve, reject)=>{
        const ssml = "<speak><prosody volume='x-loud' rate='slow'><lang xml:lang='"+lang+"'>"+text+"</lang></prosody></speak>"
        var voiceId = chooseLanguageActor(lang);
        let params = {
            OutputFormat: "ogg_vorbis",
            Text: ssml,
            VoiceId: voiceId,
            TextType: "ssml"
        }
        polly.synthesizeSpeech(params, (err, data) => {
            if (err)
                return reject("Failed to process text to speech: " + err.code);
            if(data){
                return resolve({contentType: data.ContentType, buffer: data.AudioStream});
            }
        });
    })
}

module.exports = {
    saveToS3: saveToS3,
    removeFromS3: removeFromS3,
    addTemporaryUrl: addTemporaryUrl,
    replaceUrl: replaceUrl,
    getUrl: getUrl,
    textToSpeech: textToSpeech
}

