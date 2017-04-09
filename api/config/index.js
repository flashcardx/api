const env = process.env.NODE_ENV || "development";
const db = require("./json/db")[env];
const dbEvents= require("./dbEvents");
const api = require("./json/api.json")[env];
const logger = require("./logger");
const logPath = require("./json/logs.json");
const email = require("./json/email.json")[env];
const lang = require("./json/lang.json");

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
    dbEvents: dbEvents,
    APIUrl: api.apiUrl,
    APIKey: api.key,
    APICacheTime: parseInt(api.cacheTime),
    APIMaxSizeUpFiles: parseInt(api.maxSizeUploadFiles),
    APIMyUrl: api.myUrl,
    APIJwtSecret: api.jwtSecret,
    APIJwtExpireTime: api.jwtExpireTime,
    urlWeb: api.urlWeb,
    emailService: email.service,
    emailUser: email.user,
    emailPassword: email.password,
    lang: lang
};

