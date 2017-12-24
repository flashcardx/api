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
        cards[i] = generateAddUrls(cards[i]);
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

//generates urls for images and audio(text to speech)
function generateAddUrls(Kard){
    var card = _.clone(Kard);
    card.imgs = card.imgs.map(img=>{
        return {width: img.width,
                height: img.height,
                hash: img.hash,
                src: getUrl(img.hash)
            }
    });
    card.TTSSrc = getUrl("TTS", "audio", {"lang":card.deckId.lang,"q":card.name});
    return card;
}

function getUrl(key, type, querystring){
    if(!key)
        return undefined;
    key = generateKey(key, type, querystring);
    return credentials.cloudfrontUrl + key;
}

function generateKey(hash, type, querystring){
    switch (type) {
        case "thumbnail":
            return "thumbnail/"+hash;
        case "audio":
            return "audio/"+ hash + "?lang="+querystring.lang+"&q="+encodeURIComponent(querystring.q);
        default:
            return "image/"+hash;
    }
}

module.exports = {
    saveToS3: saveToS3,
    removeFromS3: removeFromS3,
    addTemporaryUrl: addTemporaryUrl,
    generateAddUrls: generateAddUrls,
    getUrl: getUrl
}

