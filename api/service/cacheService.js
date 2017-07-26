const env = process.env.NODE_ENV || "development";
const redis = require('redis');  
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT); 
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

/*
if(env == "development")
    client.flushdb( function (err, succeeded) {
        if(err){
            logger.error("error when trying to flush redis db: " + err);
            return;
        }
        logger.warn("redis cache flushed result: " + succeeded); // will be true if successfull
});
*/

//message already is a string, so does not need parsing
function putBingResults(q, msg){ 
    var cacheKey = genKeyBingResults(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", 604800); // value in seconds = 7 days
}

function getBingResults(q){
    var cacheKey = genKeyBingResults(q);
    return new Promise((resolve, reject)=>{
          client.get(cacheKey, function (err, data) {
            if (err){
                    logger.error("error when getting data from redis: " + err);
                    return reject(err);
                }
            return resolve(JSON.parse(data));
        });
    });
}

function genKeyBingResults(q){
    return "BingResults" + q;
}




module.exports = {
    putBingResults: putBingResults,
    getBingResults: getBingResults

};