const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require("./userService");
const dictionaryCommons = require("./dictionaryServiceCommons");
const logger = config.getLogger(__filename);

function toggleAutocomplete(userId, callback){
    userService.findById(userId, 'preferences lang', result=>{
        if(result.success === false)
            return callback(result);
        var user = result.msg;
        if(user.preferences.autoComplete === false){
            if(dictionaryCommons.langIsSupported(user.lang) === false)
                return callback({success:false, msg: "Current languaje not supported, autocomplete is available for: " + dictionaryCommons.SUPPORTED_LANGS});
            user.preferences.autoComplete = true;
        }
        else
            user.preferences.autoComplete = false;
        userService.saveUser(user, r=>{
            if(r.success === false)
                return callback(r);
            return callback({success: true});
        })
    });
}

function getPreferences(userId, callback){
    userService.findById(userId,'preferences', (result)=>{
            if(result.success === false)
                return callback(result);
            var user = result.msg;
            return callback({success: true, msg:user.preferences});
        });
}

function turnOffAutocomplete(userModel, callback){
    userModel.preferences.autoComplete = false;
    userService.saveUser(userModel, callback);
}


module.exports = {
    toggleAutocomplete: toggleAutocomplete,
    getPreferences: getPreferences,
    turnOffAutocomplete: turnOffAutocomplete
}
