const env = process.env.NODE_ENV || "development";
const redis = require('redis');  
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT); 
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

if(env == "development")
    client.flushdb( function (err, succeeded) {
        if(err){
            logger.error("error when trying to flush redis db: " + err);
            return;
        }
        logger.warn("redis cache flushed result: " + succeeded); // will be true if successfull
});

//message already is a string, so does not need parsing
function putBingResults(q, lang, msg){ 
    var cacheKey = genKeyBingResults(q, lang);
    client.set(cacheKey, JSON.stringify(msg), "EX", 604800); // value in seconds = 7 days
}

function getBingResults(q, lang){
    var cacheKey = genKeyBingResults(q, lang);
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

function genKeyBingResults(q, lang){
    return "BingResults" + q + lang;
}


function putClassRecommendations(userId, lang, msg){
    var cacheKey = genKeyClassRecommend(userId, lang);
    client.set(cacheKey, JSON.stringify(msg), "EX", 86400); // value in seconds = 24 hrs
}

function getClassRecommendations(userId, lang, msg){
    var cacheKey = genKeyClassRecommend(userId, lang);
    return new Promise((resolve, reject)=>{
          client.get(cacheKey, function (err, data) {
            if (err){
                    logger.error("error when getting data from redis: " + err);
                    return reject(err);
                }
            logger.info("redis got data: " + JSON.stringify(data));
            return resolve(JSON.parse(data));
        });
    });
}

function popFromClassRecommendations(userId, lang, classId){
    return getClassRecommendations(userId, lang)
          .then(data=>{
              if(!data)
                return Promise.resolve();

              var classes = data.filter(c=>{
                  return c._id != classId;
              })
              if(classes.length == data.length)
                    return Promise.resolve();
              putClassRecommendations(userId, lang, classes);
              return Promise.resolve();
          })
        .catch(err=>{
            return Promise.reject(err);
        })
}

function genKeyClassRecommend(userId, lang){
    return "classRecommend" + userId + lang;
}






module.exports = {

    putClassRecommendations: putClassRecommendations,
    getClassRecommendations: getClassRecommendations,
    popFromClassRecommendations: popFromClassRecommendations,
    putBingResults: putBingResults,
    getBingResults: getBingResults

};