const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cache = require("memory-cache");
const S = require("string");
const userService = require(appRoot + "/service/userService");
const dictionaryService = require(appRoot + "/service/dictionaryService");
const imgSearchService = require(appRoot + "/service/imgSearchService");
const shutterstock = require('shutterstock');
const shutterstockAPI = shutterstock.v2({
  clientId: '2a32fb3e058e7de16156',
  clientSecret: '0d096f428d635dd82c83ed3b87116370c2825255',
});

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/search/:criteria", controllerUtils.requireLogin, function(req,res){
        userService.findById(req.userId, (result)=>{
                if(!result.success)
                    return res.json(result);
                const user = result.msg;
                const criteria = S(req.params.criteria).replaceAll(" ", "+").s;
                var page = 1;
                if(req.query.page)
                    page = req.query.page;
               imgSearchService.search(criteria, user.lang, page, result=>{
                    return res.json(result);
               });
            });
        });

        app.get("/examples/:word", controllerUtils.requireLogin, (req, res)=>{
            const word = req.params.word;
            dictionaryService.define(req.userId, word, r=>{
                res.json(r);
            });
        });

};