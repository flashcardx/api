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
    const controllerUtils = require(appRoot + "/middleware").utils(app);

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

        app.get("/searchBing/:q/:clientIp", controllerUtils.requireLogin, function(req,res){
               //const criteria = S(req.params.criteria).replaceAll(" ", "+").s;
               imgSearchService.searchBing(req.params.q, req.params.clientIp, result=>{
                    return res.json(result);
               });
            });
        
/**
 * @api {get} /searchGif/:q searchGif
 * @apiGroup search
 * @apiName searchGif
 * @apiDescription receives search parameters and returns array with gif images.
 * @apiParam (Parameters) {string} q search parameter.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {Parameter} Request-Example:
 * curl localhost:3000/searchGif/holis
 * @apiVersion 1.0.0
 *  */
    app.get("/searchGif/:q", controllerUtils.requireLogin, function(req,res){
        imgSearchService.searchGif(req.params.q, result=>{
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