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
    getImgFromS3: getImgFromS3,
    removeFromS3: removeFromS3
}

