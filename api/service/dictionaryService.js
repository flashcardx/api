const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require("requestify");
const dictionaries = config.dictionaries;
const userService = require("./userService");
const preferencesService = require("./preferencesService");

function defineEnglish(word, callback){
   var url = dictionaries.UrlEnglish + "/" + word +"/examples?includeDuplicates=false&useCanonical=true&skip=0&limit=5&api_key=" + dictionaries.englishAPIKey;
   requestify.get(url).then(response=>{
            var resBody = response.getBody();
            return callback(resBody);
    }); 
}

function define(userId, word, callback){
    userService.findById(userId, (r)=>{
        if(r.success === false)
            return callback(r);
        var user = r.msg;
        if(user.preferences.autoComplete === false)
            return callback({success:false, msg: "autoComplete mode is off for user"});
        switch(user.lang){
            case "en":  return defineEnglish(word, callback);
            default: preferencesService.turnOffAutocomplete(user, result=>{
                        return callback({success:false, msg:"current languaje is not supported"});
                    });
        }
     });
}



module.exports = {
    define: define
}