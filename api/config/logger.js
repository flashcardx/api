const env = process.env.NODE_ENV || "development";
const fs = require('fs');
const bunyan = require("bunyan");
const bformat = require('bunyan-format')  
const formatOut = bformat({ outputMode: 'short', levelInString: true});
const logs = require("./json/logs.json")[env];
const appRoot = require('app-root-path');

function getLogger(name){
        return  new bunyan({
                name: name,
                streams: [
                     {
                     level: logs.levelFile,
                     path: appRoot + logs.app
                    },
                    {
                     level: logs.levelConsole,
                     stream: formatOut // log ERROR and above to stdout
                    }
                ],
                 serializers: bunyan.stdSerializers
            });
    };

 function getLoggerAccess(name){
        return  new bunyan({
                name: name,
                streams: [
                     {
                     level: logs.levelFile,
                     path: appRoot + logs.access
                    },
                    {
                     level: logs.levelConsole,
                     stream: formatOut  // log WARN and above to stdout
                    }
                ],
                 serializers: bunyan.stdSerializers
            });
    }
    
module.exports = {
    getLogger: getLogger,
    getLoggerAccess: getLoggerAccess
}; 