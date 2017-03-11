const fs = require('fs');
const bunyan = require("bunyan");
const logPath = require("./logs.json");
const appRoot = require('app-root-path');

function getLogger(name){
        return  new bunyan({
                name: name,
                streams: [
                     {
                     level: 'info',
                     path: appRoot + logPath.app
                    },
                    {
                     level: 'warn',
                     stream: process.stdout  // log ERROR and above to stdout
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
                     level: 'info',
                     path: appRoot + logPath.access
                    },
                    {
                     level: 'warn',
                     stream: process.stdout  // log WARN and above to stdout
                    }
                ],
                 serializers: bunyan.stdSerializers
            });
    }
    
module.exports = {
    getLogger: getLogger,
    getLoggerAccess: getLoggerAccess
}; 