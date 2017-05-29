const appRoot = require('app-root-path');
const env = process.env.NODE_ENV || "development";
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const SUPPORTED_LANGS = "English";


function langIsSupported(lang){
    if(lang === "en")
        return true;
    return false;
}

module.exports = {
    langIsSupported: langIsSupported,
    SUPPORTED_LANGS: SUPPORTED_LANGS
}