const env = process.env.NODE_ENV || "development";
const db = require("./json/db")[env].mongo;
const redis = require("./json/db")[env].redis;
const dbEvents= require("./dbEvents");
const parameters = require("./json/parameters.json")[env];
const logger = require("./logger");
const logPath = require("./json/logs.json");
const email = require("./json/email.json")[env];
const credentials = require("./json/credentials.json")[env];
const lang = require("./json/lang.json");
const dictionaries = require("./json/dictionaries.json")[env]; 

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
     getRedisConnectionString: function() {
        return `redis://${redis.user}:${redis.pass}@${redis.host}:${redis.port}/${redis.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
    dbEvents: dbEvents,
    MaxSizeUpFiles: parseInt(parameters.maxSizeUploadFiles),
    JwtExpireTime: parameters.jwtExpireTime,
    cacheTimeDictionary: parameters.cacheTime.dictionary,
    cacheTimeImageSearch: parameters.cacheTime.imageSearch,
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
    facebookCredentials: credentials.facebook
};

