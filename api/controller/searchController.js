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

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.get("/search/:criteria", controllerUtils.requireLogin, function(req,res){
        userService.findById(req.userId, 'lang', (result)=>{
                if(!result.success)
                    return res.json(result);
                const user = result.msg;
                const criteria = S(req.params.criteria).replaceAll(" ", "+").s;
                var page = 1;
                if( req.query.page)
                    page = req.query.page;
               imgSearchService.search(criteria, user.lang, page, result=>{
                    return res.json(result);
               });
            });
        });

        app.get("/searchBing/:criteria/:clientIp", controllerUtils.requireLogin, function(req,res){
                const criteria = S(req.params.criteria).replaceAll(" ", "+").s;
               imgSearchService.searchBing(criteria, req.params.clientIp, result=>{
                    return res.json(result);
               });
            });

        app.get("/examples/:word", controllerUtils.requireLogin, (req, res)=>{
            const word = req.params.word;
            dictionaryService.examples(req.userId, word, r=>{
                res.json(r);
            });
        });

        app.get("/define/:word", controllerUtils.requireLogin, (req, res)=>{
            const word = req.params.word;
            dictionaryService.define(req.userId, word, r=>{
                res.json(r);
            });
        });

         app.get("/suggest/:word", controllerUtils.requireLogin, (req, res)=>{
            const word = req.params.word;
            dictionaryService.suggest(req.userId, word, r=>{
                res.json(r);
            });
        });

};