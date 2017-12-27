const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require("requestify");
const dictionaries = config.dictionaries;
const userService = require("./userService");
const cacheService = require("./cacheService");
const preferencesService = require("./preferencesService");
const translator = require('google-translate-api');
const SUPPORTED_LANGS = "English";


function translate(text, from, to, callback){
    translator(text, {from:from, to: to})
    .then(res => {
        return callback({success:true, text:res.text, from:res.from.language.iso});
    })
    .catch(err => {
        console.error(err);
        callback({success:false, msg:err});
    });
}


function langIsSupported(lang){
    if(lang == "en")
        return true;
    return false;
}

function defineEnglish(word, callback){
   cacheService.getDictionaryResults("es", word)
   .then(results=>{
        if(results){
                logger.error("results: ", results);
                return callback({success:true, msg:results});
            }
        const url = dictionaries.UrlEnglish + "/" + word +"/definitions?limit=5&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=" + dictionaries.englishAPIKey;
        requestify.get(url).then(response=>{
                    const resBody = response.getBody();
                    const text = parseEnglishResultDefine(resBody);
                    cacheService.putDictionaryResults("es", word, text);
                    return callback({success:true, msg:text});
            }); 
   })
    .catch(err=>{
        logger.error("error in define english: ", err);
        return callback({success:false, msg: err});
    });
}

function parseEnglishResultDefine(r){
    var text = "";
    for(var i=0; i < r.length && i < 5; i++){
        text += "-" + r[i].partOfSpeech +", "+ r[i].text +"\n";
    }
    return text;
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
                        return callback({success:false, msg:"Current languaje is not supported, autocomplete is available for: " + SUPPORTED_LANGS});
                    });
        }
     });
}

function suggest(userId, word, callback){
    userService.findById(userId, 'lang', (r)=>{
        if(r.success === false)
            return callback(r);
        var user = r.msg;
        if(user.lang === "en" || user.lang === "es"){
            var url = dictionaries.autocomplete  + "/sug?s=" + word;
            requestify.get(url).then(response=>{
                const resBody = response.getBody();
                return callback({success:true, msg:resBody});
            }); 
        }
        else
            return callback({success:false, msg:"Current languaje is not supported"});
     });
}

module.exports = {
    define: define,
    suggest: suggest,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    langIsSupported: langIsSupported
}