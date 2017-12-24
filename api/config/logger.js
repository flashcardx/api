const env = process.env.NODE_ENV || "development";
const fs = require('fs');
const bunyan = require("bunyan");
const bformat = require('bunyan-format')  
const formatOut = bformat({ outputMode: 'short', levelInString: true});
const logs = require("./json/logs.json")[env];

function getLogger(name){
        return  new bunyan({
                name: name,
                streams: [
                    {
                     level: logs.levelConsole,
                     stream: formatOut 
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
                     level: logs.levelConsole,
                     stream: formatOut 
                    }
                ],
                 serializers: bunyan.stdSerializers
            });
    }
    
module.exports = {
    getLogger: getLogger,
    getLoggerAccess: getLoggerAccess
}; 