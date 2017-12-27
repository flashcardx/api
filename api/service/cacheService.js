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

function putUserPracticeResults(userId, msg){ 
    var cacheKey = genKeyUserPractice(userId);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeUserPractice); //cache time in seconds
}

function putGifResults(q, msg){ 
    var cacheKey = genKeyGif(q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeImageSearch); //cache time in seconds
}

function putDictionaryResults(lang, q, msg){ 
    var cacheKey = genKeyDictionary(lang, q);
    client.set(cacheKey, JSON.stringify(msg), "EX", config.cacheTimeDictionary);//cache time in seconds
}

function putTranslatorLastLang(userId, lang){
    var cacheKey = genKeyTranslatorLastLang(userId, lang);
    client.set(cacheKey, lang, "EX", config.cacheTimeTranslateLang);//cache time in seconds
}

function getImageResults(q){
    return new Promise((resolve, reject)=>{
        var cacheKey = genKeyImage(q);
        getResults(cacheKey)
        .then(r=>{
            return resolve(JSON.parse(r));
        })
        .catch(err=>{
            return reject(err);
        })
    })
}

function getGifResults(q){
    return new Promise((resolve, reject)=>{
        var cacheKey = genKeyGif(q);
        return getResults(cacheKey)
        .then(r=>{
            return resolve(JSON.parse(r));
        })
        .catch(err=>{
            return reject(err);
        })
    });
}

function getDictionaryResults(lang, q){
    var cacheKey = genKeyDictionary(lang, q);
    return getResults(cacheKey);
}

function getUserPracticeResults(userId){
    var cacheKey = genKeyUserPractice(userId);
    return getResults(cacheKey);
}

function getTranslatorLastLang(userId){
    var cacheKey = genKeyTranslatorLastLang(userId);
    return getResults(cacheKey);
}

function getResults(cacheKey){
    return new Promise((resolve, reject)=>{
          client.get(cacheKey, function (err, data) {
            if (err){
                    logger.error("error when getting data from redis: " + err);
                    return reject(err);
                }
            var json;
            try
            {
                json = JSON.parse(data);
            }
            catch(e)
            {
                //if gets here, objects is not json
                json = data;
            }
            return resolve(data);
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

function genKeyUserPractice(userId){
    return "userPractice-" + userId;
}

function genKeyTranslatorLastLang(userId){
    return "translateLastLang-"+userId;
}

module.exports = {
    putImageResults: putImageResults,
    getImageResults: getImageResults,
    putGifResults: putGifResults,
    getGifResults: getGifResults,
    putDictionaryResults: putDictionaryResults,
    getDictionaryResults: getDictionaryResults,
    getUserPracticeResults: getUserPracticeResults,
    putUserPracticeResults: putUserPracticeResults,
    putTranslatorLastLang: putTranslatorLastLang,
    getTranslatorLastLang: getTranslatorLastLang
};