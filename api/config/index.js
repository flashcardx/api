const env = process.env.NODE_ENV || "development";
const db = require(process.env.HOME+"/flashcardx-keys/db.json")[env];
const mongo = db.mongo;
const redis = db.redis; 
const dbEvents= require("./dbEvents");
const parameters = require("./json/parameters.json")[env];
const Logger = require("./logger");
const logger = Logger.getLogger(__filename); 
const email = require(process.env.HOME+"/flashcardx-keys/email.json")[env];
const credentials = require(process.env.HOME+"/flashcardx-keys/credentials.json")[env];
const lang = require("./json/lang.json");
const errorCodes = require("./json/errorCodes.json");
const dictionaries = require("./json/dictionaries.json")[env]; 
const mongoose = require("mongoose");

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${mongo.user}:${mongo.pass}@${mongo.host}:${mongo.port}/${mongo.name}`;
    },
     getRedisConnectionString: function() {
        return `redis://${redis.user}:${redis.pass}@${redis.host}:${redis.port}/${redis.name}`;
    },
    getLogger: Logger.getLogger,
    getLoggerAccess: Logger.getLoggerAccess,
    MaxSizeUpFiles: parseInt(parameters.maxSizeUploadFiles),
    JwtExpireTime: parameters.jwtExpireTime,
    cacheTimeDictionary: parameters.cacheTime.dictionary,
    cacheTimeImageSearch: parameters.cacheTime.imageSearch,
    cacheTimeUserPractice: parameters.cacheTime.userPractice,
    urlWeb: parameters.urlWeb,
    emailService: email.service,
    emailUser: email.user,
    emailPassword: email.password,
    lang: lang,
    AWSCredentials: credentials.AWS,
    dictionaries: dictionaries,
    BingKey: credentials.bing.key,
    BingUrl: credentials.bing.url,
    reCaptchaSecret: credentials.reCaptcha.secretKey,
    reCaptchaUrl: credentials.reCaptcha.url,
    gifApiUrl: credentials.tenorGifApi.url,
    gifApiKey: credentials.tenorGifApi.secretKey,
    facebookCredentials: credentials.facebook,
    googleCredentials: credentials.google,
    credentials: credentials,
    jwtSecret: credentials.jwtSecret,
    errorCodes: errorCodes,
    connectMongoose: connectMongoose
};

function connectMongoose(){
    mongoose.connect(module.exports.getDbConnectionString(),
                {useMongoClient: true});
    mongoose.connection.on('disconnected', function () {  
                logger.warn('Mongoose default connection disconnected(child process)'); 
                mongoose.connect(module.exports.getDbConnectionString(),
                {useMongoClient: true});
        });
    dbEvents();
}

