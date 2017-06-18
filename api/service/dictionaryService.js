const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require("requestify");
const dictionaries = config.dictionaries;
const userService = require("./userService");
const preferencesService = require("./preferencesService");
const commons = require("./dictionaryServiceCommons");
const cache = require("memory-cache");

function examplesEnglish(word, callback){
   const cacheKey = "en-ex" + word ;
   var results = cache.get(cacheKey);
                if(results){
                    return callback({success:true, msg:results});
                }
   const url = dictionaries.UrlEnglish + "/" + word +"/examples?includeDuplicates=false&useCanonical=true&skip=0&limit=5&api_key=" + dictionaries.englishAPIKey;
   requestify.get(url).then(response=>{
            const resBody = response.getBody();
            const text = parseEnglishResultExamples(resBody.examples);
            cache.put(cacheKey, text, config.APICacheTime);
            return callback({success:true, msg:text});
    }); 
}

function defineEnglish(word, callback){
   const cacheKey = "en-def" + word ;
   var results = cache.get(cacheKey);
                if(results){
                    return callback({success:true, msg:results});
                }
   const url = dictionaries.UrlEnglish + "/" + word +"/definitions?limit=5&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=" + dictionaries.englishAPIKey;
   requestify.get(url).then(response=>{
            const resBody = response.getBody();
            const text = parseEnglishResultDefine(resBody);
            cache.put(cacheKey, text, config.APICacheTime);
            return callback({success:true, msg:text});
    }); 
}

function parseEnglishResultExamples(r){
    var text = "";
    for(var i=0; i < r.length && i < 3; i++){
        text += "-" + r[i].text +"\n";
    }
    return text;
}

function parseEnglishResultDefine(r){
    var text = "";
    for(var i=0; i < r.length && i < 5; i++){
        text += "-" + r[i].partOfSpeech +", "+ r[i].text +"\n";
    }
    return text;
}

function examples(userId, word, callback){
    userService.findById(userId, 'preferences lang', (r)=>{
        if(r.success === false)
            return callback(r);
        var user = r.msg;
        if(user.preferences.autoComplete === false)
            return callback({success:false, msg: "autocomplete mode is off for user"});
        switch(user.lang){
            case "en":  return examplesEnglish(word, callback);
            default: preferencesService.turnOffAutocomplete(user, result=>{
                        return callback({success:false, msg:"Current languaje is not supported, autocomplete is available for: " + commons.SUPPORTED_LANGS});
                    });
        }
     });
}

function define(userId, word, callback){
    userService.findById(userId, 'preferences lang', (r)=>{
        if(r.success === false)
            return callback(r);
        var user = r.msg;
        if(user.preferences.autoComplete === false)
            return callback({success:false, msg: "autocomplete mode is off for user"});
        switch(user.lang){
            case "en":  return defineEnglish(word, callback);
            default: preferencesService.turnOffAutocomplete(user, result=>{
                        return callback({success:false, msg:"Current languaje is not supported, autocomplete is available for: " + commons.SUPPORTED_LANGS});
                    });
        }
     });
}


module.exports = {
    define: define,
    examples: examples
}