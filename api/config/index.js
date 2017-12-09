const env = process.env.NODE_ENV || "development";
const db = require("$HOME/flashcardx-keys/json/db")[env];
const dbEvents= require("./dbEvents");
const parameters = require("./json/parameters.json")[env];
const logger = require("./logger");
const logPath = require("./json/logs.json");
const email = require("$HOME/flashcardx-keys/email.json")[env];
const credentials = require("$HOME/flashcardx-keys/credentials.json")[env];
const lang = require("./json/lang.json");
const dictionaries = require("./json/dictionaries.json")[env]; 

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
    dbEvents: dbEvents,
    APIMaxSizeUpFiles: parseInt(parameters.maxSizeUploadFiles),
    APIMyUrl: parameters.myUrl,
    APIJwtExpireTime: parameters.jwtExpireTime,
    urlWeb: parameters.urlWeb,
    emailService: email.service,
    emailUser: email.user,
    emailPassword: email.password,
    lang: lang,
    AWSCredentials: credentials.AWS,
    apiCredentials: credentials.thisApi,
    dictionaries: dictionaries,
    BingKey: credentials.bing.key,
    BingUrl: credentials.bing.url,
    reCaptchaSecret: credentials.reCaptcha.secretKey,
    reCaptchaUrl: credentials.reCaptcha.url,
    gifApiUrl: credentials.tenorGifApi.url,
    gifApiKey: credentials.tenorGifApi.secretKey
};

