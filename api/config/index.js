const env = process.env.NODE_ENV || "development";
const db = require("./db")[env];
const dbEvents= require("./dbEvents");
const api = require("./api.json")[env];
const logger = require("./logger");
const logPath = require("./logs.json");
const email = require("./email.json")[env];

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
    dbEvents: dbEvents,
    APIUrl: api.url,
    APIKey: api.key,
    APICacheTime: parseInt(api.cacheTime),
    APIMaxSizeUpFiles: parseInt(api.maxSizeUploadFiles),
    APIMyUrl: api.myUrl,
    emailService: email.service,
    emailUser: email.user,
    emailPassword: email.password
};

