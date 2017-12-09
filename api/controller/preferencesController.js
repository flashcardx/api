const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const preferencesService = require(appRoot + "/service/preferencesService");
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

    app.get("/langs", (req, res)=>{
        res.json(config.lang);
    });

    app.get("/userPreferences", controllerUtils.requireLogin, (req, res)=>{
        preferencesService.getPreferences(req.userId, result=>{
            res.json(result);
        })
    });

    app.get("/toggleAutocomplete", controllerUtils.requireLogin, (req, res)=>{
        preferencesService.toggleAutocomplete(req.userId, r=>{
            res.json(r);
        });
    });

}