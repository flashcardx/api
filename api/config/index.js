const env = process.env.NODE_ENV || "development";
const db = require("$HOME/flashcardx-keys/json/db")[env];
const dbEvents= require("./dbEvents");
const parameters = require("./json/parameters.json")[env];
const logger = require("./logger");
const email = require("$HOME/flashcardx-keys/email.json")[env];
const credentials = require("$HOME/flashcardx-keys/credentials.json")[env];
const lang = require("./json/lang.json");
const errorCodes = require("./json/errorCodes.json");
const dictionaries = require("./json/dictionaries.json")[env]; 
const mongoose = require("mongoose");

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
     getRedisConnectionString: function() {
        return `redis://${redis.user}:${redis.pass}@${redis.host}:${redis.port}/${redis.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
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

