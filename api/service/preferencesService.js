const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require("./userService");
const dictionaryService = require("./dictionaryService");
const logger = config.getLogger(__filename);


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
    getPreferences: getPreferences,
    turnOffAutocomplete: turnOffAutocomplete
}
