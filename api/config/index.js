const env = process.env.NODE_ENV || "development";
const db = require("./db")[env];
const logger = require("./logger");
const logPath = require("./logs.json");
const dbEvents= require("./dbEvents");

module.exports = {

    getDbConnectionString: function() {
        return `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${db.name}`;
    },
    getLogger: logger.getLogger,
    getLoggerAccess: logger.getLoggerAccess,
    dbEvents: dbEvents
};

