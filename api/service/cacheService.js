const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const redis = require('redis');  
const config = require(appRoot + "/config");
const client = redis.createClient({
    url: config.getRedisConnectionString()
});
const logger = config.getLogger(__filename);

function putImageResults(q, msg){ 
    var cacheKey = genKeyImage(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeImageSearch);//cache time in seconds
}

function putGifResults(q, msg){ 
    var cacheKey = genKeyGif(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeImageSearch); //cache time in seconds
}

function putDictionaryResults(lang, q, msg){ 
    var cacheKey = genKeyDictionary(lang, q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeDictionary);//cache time in seconds
}

function putTextToSpeechResults(lang, q, msg){ 
    var cacheKey = genKeyTextToSpeech(lang, q);
    client.hmset(cacheKey, ["result", JSON.stringify(msg), "date", new Date()]);
}

function getImageResults(q){
    var cacheKey = genKeyImage(q);
    return getResults(cacheKey);
}

function getGifResults(q){
    var cacheKey = genKeyGif(q);
    return getResults(cacheKey);
}

function getDictionaryResults(lang, q){
    var cacheKey = genKeyDictionary(lang, q);
    return getResults(cacheKey);
}

function getTextToSpeechResults(lang, q){
    var cacheKey = genKeyTextToSpeech(lang, q);
    return getResults(cacheKey + " result");
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

function genKeyImage(q){
    return "ImageCache" + q;
}

function genKeyGif(q){
    return "GifCache" + q;
}

function genKeyDictionary(lang, q){
    return "DictionaryCache" + lang + "-" + q;
}

function genKeyTextToSpeech(lang, q){
    // we add the date so we can track unused old records in the future
    return "TextToSpeechCache" + lang + "-" + q;
}




module.exports = {
    putImageResults: putImageResults,
    getImageResults: getImageResults,
    putGifResults: putGifResults,
    getGifResults: getGifResults,
    putDictionaryResults: putDictionaryResults,
    getDictionaryResults: getDictionaryResults,
    putTextToSpeechResults: putTextToSpeechResults,
    getTextToSpeechResults: getTextToSpeechResults
};