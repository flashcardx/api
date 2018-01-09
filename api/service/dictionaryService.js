const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require("requestify");
const dictionaries = config.dictionaries;
const userService = require("./userService");
const cacheService = require("./cacheService");
const deckService = require("./deckService");
const AWSService = require("./AWSService");
const _ = require("lodash")
const preferencesService = require("./preferencesService");
const translator = require('google-translate-api');
const {extractContentFromHTML} = require(appRoot+"/utils/string");


function translate(userId, deckId, text, from, to, callback){
    translator(text, {from:from, to: to})
    .then(res => {
        const audioSrc = AWSService.generateTTSUrl(res.text, to);
        callback({success:true, audioSrc: audioSrc, text:res.text, from:res.from.language.iso});
        return Promise.resolve();
    })
    .then(()=>{
        return deckService.validateOwnership(userId, deckId);
    })
    .then(()=>{
        cacheService.putTranslatorLastLangs(userId, deckId, from, to);
    })
    .catch(err => {
        logger.error(err);
        callback({success:false, msg:err});
    });
}

function getTranslatorLastLangs(userId, deckId){
    return new Promise((resolve, reject)=>{
        deckService.validateOwnership(userId, deckId)
        .then(()=>{
            return cacheService.getTranslatorLastLangs(userId, deckId);
        })  
        .then(r=>{
            resolve(r);
        })
        .catch(err=>{
            reject(err);
        })
    });
}

function getWikipediaResults(lang, word){
    return new Promise((resolve, reject)=>{
        const url = "https://"+lang+dictionaries.wikipediaOpenSearch+word;
        requestify.get(url)
        .then(response=>{
            const resBody = response.getBody();
            resolve(parseWikipediaResultDefine(resBody[2]))
        })
        .catch(err=>{
            reject(err)     
        })
    });
}

function defineEnglish(word, callback){
   cacheService.getDictionaryResults("en", word)
   .then(results=>{
        if(results){
               callback({success:true, msg:results});
               return Promise.reject()
        }
        const url = dictionaries.UrlEnglish + "/" + word +"/definitions?limit=5&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=" + dictionaries.englishAPIKey;
        return requestify.get(url) 
    })
    .then(response=>{
                const resBody = response.getBody();
                const text = parseEnglishResultDefine(resBody);
                if(!text)
                    return getWikipediaResults("en", word);
                else
                    return Promise.resolve(text);
    })
    .then(text=>{
                cacheService.putDictionaryResults("en", word, text);
                return callback({success:true, msg:text});
    })
    .catch(err=>{
        if(err){
            logger.error("error in define english: ", err);
            return callback({success:false, msg: err});
        }
    });
}

function defineOthers(word, langCode, callback){
    cacheService.getDictionaryResults(langCode, word)
    .then(results=>{
                if(results){
                    callback({success:true, msg:results});
                    return Promise.reject()
                }
        const url = dictionaries.glosbeDictionraryUrl + "?format=json&pretty=true&tm=true&from=" + langCode + "&dest=" + langCode + "&phrase="+word
        return requestify.get(url)
    })
    .then(response=>{
                const resBody = response.getBody();
                return parseGlosbeResultDefine(resBody);
    })
    .then(text=>{
            if(text)
                return Promise.resolve(text)
            else
                return getWikipediaResults(langCode, word);
    })
    .then(text=>{
        cacheService.putDictionaryResults(langCode, word, text);
        return callback({success:true, msg:text});            
    })
    .catch(err=>{
         if(err){
             logger.error("error in define others: ", err);
             return callback({success:false, msg: err});
         }
    });
}

function parseEnglishResultDefine(r){
    var text = "";
    for(var i=0; i < r.length && i < 5; i++){
        text += "-" + r[i].partOfSpeech +", "+ r[i].text +"\n";
    }
    return text;
}

function parseWikipediaResultDefine(r){
    var text = "";
    for(var i=0; i < r.length && i < 4; i++){
        if(r[i])
            text += "-" + r[i] +"\n";
    }
    return text;
}

function parseGlosbeResultDefine(r){
    var text= "",
        lines = 4;
    var promises = [];
    const meanings = _.isEmpty(r.tuc)? null: r.tuc[0].meanings; 
    if(meanings && meanings.lenght !== 0){
        for(var i=0; i < meanings.length && i<2; i++){
            lines--;
            const promise = extractContentFromHTML(meanings[i].text)
            promises.push(promise);
        }
    }
    const examples = r.examples;
    for(var i=0; i < examples.length && i<lines; i++){
         const promise = extractContentFromHTML(examples[i].first)
         promises.push(promise);
    }
    return new Promise((resolve, reject)=>{
        Promise.all(promises)
        .then(values=>{
            values.forEach(v=>{
                text += "-"+v+"\n"
            })
            resolve(text);
        })
        .catch(err=>{
            reject(err);
        })
    });
}

function define(lang, word, callback){
    word = word.toLowerCase();
    switch(lang){
            case "en":  return defineEnglish(word, callback);
            default: return defineOthers(word, lang, callback) 
    }
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
    translate: translate,
    getTranslatorLastLangs: getTranslatorLastLangs
}