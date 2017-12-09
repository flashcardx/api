const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const lang = config.lang;
var langCodes = lang.map((value)=>{
    return value.code;
});

function validateLang(lang){
    for(var i=0; i<langCodes.length; i++)
        if(langCodes[i] == lang)
            return true;
    return false;
}

module.exports = {
    validateLang
}