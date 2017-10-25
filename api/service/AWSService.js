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
var s3 = new AWS.S3();
var bucketName = credentials.bucketName;

function saveToS3(key, contentType, data, callback){
    var params = {Bucket: bucketName, Key: key, Body: data, ContentType: contentType};
    s3.putObject(params, callback);
}

function saveToS3Buffer(key, data, callback){
    var params = {Bucket: bucketName, Key: key, Body: data};
    s3.putObject(params, callback);
}


function getImgFromS3(id, callback){
    var keyName = id;
    var bucketParams = {Bucket: bucketName, Key:keyName};
    s3.getObject(bucketParams, (err, data)=>{
        if(err){
            logger.error(err);
            return callback(err, null, null);
        }
        callback(null, data.ContentType, data.Body);
});
}

//IMAGES FROM CLOUD FRONT
function addTemporaryUrl(cards, callback){
    if(cards.length === 0)
        return callback({success:true, msg:[]});
    var expireAfter = 600; //url expires after 600 seconds
    cards.forEach((card, i)=>{
        cards[i] = replaceImgsUrl(cards[i]);
    });
    return callback({success:true, cards: cards});
}


function removeFromS3(hash, callback){
    var bucketParams = {Bucket: bucketName, Key:hash};
    s3.deleteObject(bucketParams, function(err, data) {
        if (err){
            logger.error("error when removing image from s3: " + err);   
            return callback({success:false, msg:err});
        }
        return callback({success:true});
        });
};

function replaceImgsUrl(Kard){
    var card = _.clone(Kard);
    logger.error("card: " , card);// prints card: {imgs:[]}
    card.imgs = "sex";
    logger.error("new card: " , card); // prints new card: {imgs:[]}
    return card;
}

function getImgUrl(id){
    if(!id)
        return undefined;
    return credentials.cloudfrontUrl + id;
}

module.exports = {
    saveToS3: saveToS3,
    saveToS3Buffer: saveToS3Buffer,
    getImgFromS3: getImgFromS3,
    removeFromS3: removeFromS3,
    addTemporaryUrl: addTemporaryUrl,
    replaceImgsUrl: replaceImgsUrl,
    getImgUrl: getImgUrl
}

