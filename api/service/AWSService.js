const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const credentials = config.AWSCredentials;
var AWS = require('aws-sdk');
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

function addTemporaryUrl(cards, callback){
    if(cards.length === 0)
        return callback({success:true, msg:[]});
    var cardIndex = 0;
    var expireAfter = 300; //url expires after 300 seconds
    cards.forEach((card, i)=>{
        var imgs = card.imgs;
        var imgIndex = 0;
        if(imgs.length === 0){
            cardIndex++;
            if(cardIndex === cards.length)
                return callback({success:true, msg: cards});
        }
        else
            cardIndex++;
        imgs.forEach((img, j)=>{
            var params = {Bucket: bucketName, Key:img.hash, Expires: expireAfter};
            s3.getSignedUrl('getObject', params, (err, url)=>{
                imgIndex++;
                if(err){
                    logger.error(err);
                    return callback({success:false, msg: String(err)});
                }
                cards[i].imgs[j].hash = url;
                if(cardIndex === cards.length && imgIndex === card.imgs.length)
                    return callback({success:true, msg: cards});
            });

        });
    })
}

function removeFromS3(hash, callback){
    var bucketParams = {Bucket: bucketName, Key:hash};
    s3.deleteObject(bucketParams, function(err, data) {
        if (err)
            return callback(err);
        return callback();
        });
};

module.exports = {
    saveToS3: saveToS3,
    saveToS3Buffer: saveToS3Buffer,
    getImgFromS3: getImgFromS3,
    removeFromS3: removeFromS3,
    addTemporaryUrl:addTemporaryUrl
}

