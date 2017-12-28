const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const S = require("string");
const userService = require(appRoot + "/service/userService");
const dictionaryService = require(appRoot + "/service/dictionaryService");
const searchService = require(appRoot + "/service/searchService");
const { query, param, validationResult } = require('express-validator/check');
const {validateLang} = require(appRoot +"/utils/validator");
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

        app.get("/searchBing/:q", controllerUtils.requireLogin,
                                controllerUtils.getIp,
                                (req,res)=>{
               const clientIp = req.ip;
               searchService.searchBing(req.params.q, clientIp, result=>{
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
    app.get("/searchGif/:q", controllerUtils.requireLogin, 
    [
        param('q','Search query max length is 40  characters')
        .isLength({max:40})
    ], controllerUtils.checkValidatorErrors,    
    (req,res) => {
        searchService.searchGif(req.params.q, result=>{
            return res.json(result);
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

        /**
     * @api {get} /translate translate
     * @apiGroup search
     * @apiName translate
     * @apiDescription A translator.
     * @apiParam (Query) {string} text The text you wanna translate.
     * @apiParam (Query) {string} [from=undefined] The iso code for the lang of the text param, if not provided the API will try to autodetect it.
     * @apiParam (Query) {string} to The iso code for the language to translate the text.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {Parameter} Request-Example:
     * curl localhost:3000/translate?text=hello&to=en
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "text": "hola",
     *      "from": "en"
     *      }
     * @apiVersion 1.0.0
     *  */
    app.get("/translate", controllerUtils.requireLogin, 
    [
        query('text','Text to translate must be between between 1 and 40 characters')
        .isLength({min:1, max:40}),
        
        query("from", "from language must be either undefined or a valid language iso code")
        .isLength({max:2}),

        query("to", "to language must be a valid language iso code")
        .isLength({min:2, max:2})
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
        const word = req.params.word;
        dictionaryService.translate(req.userId, req.query.text, req.query.from, req.query.to, r=>{
            res.json(r);
        });
    });
};