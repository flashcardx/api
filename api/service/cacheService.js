const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const redis = require('redis');  
const config = require(appRoot + "/config");
const client = redis.createClient({
    url: config.getRedisConnectionString()
});
const logger = config.getLogger(__filename);

function putBingResults(q, msg){ 
    var cacheKey = genKeyBingResults(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeImageSearch);//cache time in seconds
}

function putGifResults(q, msg){ 
    var cacheKey = genKeyGifResults(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeImageSearch); //cache time in seconds
}

function putDictionaryResults(lang, q, msg){ 
    var cacheKey = genKeyDictionaryResults(lang, q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeDictionary);//cache time in seconds
}

function putPollyResults(lang, q, msg){ 
    var cacheKey = genKeyPollyResults(lang, q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeDictionary);//cache time in seconds
}

function getBingResults(q){
    var cacheKey = genKeyBingResults(q);
    return getResults(cacheKey);
}

function getGifResults(q){
    var cacheKey = genKeyGifResults(q);
    return getResults(cacheKey);
}

function getDictionaryResults(lang, q){
    var cacheKey = genKeyDictionaryResults(lang, q);
    return getResults(cacheKey);
}

function getPollyResults(lang, q){
    var cacheKey = genKeyPollyResults(lang, q);
    return getResults(cacheKey);
}


function getResults(cacheKey){
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
    return "BingCache" + q;
}

function genKeyGifResults(q){
    return "GifCache" + q;
}

function genKeyDictionaryResults(lang, q){
    return "DictionaryCache" + lang+ "-" + q;
}

function genKeyPollyResults(lang, q){
    return "PollyCache" + lang+ "-" + q;
}




module.exports = {
    putBingResults: putBingResults,
    getBingResults: getBingResults,
    putGifResults: putGifResults,
    getGifResults: getGifResults,
    putDictionaryResults: putDictionaryResults,
    getDictionaryResults: getDictionaryResults,
    putPollyResults: putPollyResults,
    getPollyResults: getPollyResults
};