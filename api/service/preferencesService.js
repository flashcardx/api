const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require("./userService");
const logger = config.getLogger(__filename);

function toggleAutocomplete(userId, callback){
    userService.findById(userId, result=>{
        if(result.success === false)
            return callback(result);
        var user = result.msg;
        if(user.preferences.autoComplete === false)
            user.preferences.autoComplete = true;
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
    userService.findById(userId, (result)=>{
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
