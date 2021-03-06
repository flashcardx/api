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


    /**
     * @api {get} /define/:lang/:word find definitions
     * @apiGroup search
     * @apiName find definitions
     * @apiDescription receives lang and word and returns definitions or examples for that word.
     * @apiParam (Parameters) {string} lang language code of the word.
     * @apiParam (Parameters) {string} word The word to define.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {Parameter} Request-Example:
     * curl localhost:3000/es/casa
     * @apiVersion 1.0.0
     *  */
    app.get("/define/:lang/:word", controllerUtils.requireLogin,
    [
        param('lang','lang code must be 2 characters long')
        .isLength({min:2, max:2}),
        
        param('word','word must be between 1 and 40 characters')
        .isLength({min:1, max:40})
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
            const word = req.params.word,
                  lang = req.params.lang;
            dictionaryService.define(lang, word, r=>{
                res.json(r);
            });
    });

       /**
     * @api {get} /suggestGeneric/:lang/:word suggest words
     * @apiGroup search
     * @apiName suggest words
     * @apiDescription Suggest words similar to the word received.
     * @apiParam {Param} {string} lang lang iso code of the word.
     * @apiParam {Param} {string} word word to suggest
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {Parameter} Request-Example:
     * curl localhost:3000/suggest/en/ello
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      }
     * @apiVersion 1.0.0
     *  */
    app.get("/spellSuggestions/:lang/:word", controllerUtils.requireLogin, (req, res)=>{
            const word = req.params.word,
                  lang = req.params.lang;
            dictionaryService.suggest(lang, word, r=>{
                res.json(r);
            });
    });

        /**
     * @api {get} /translate/:deckId translate
     * @apiGroup search
     * @apiName translate
     * @apiDescription A translator.
     * @apiParam {Param} {string} deckId id of the deck where the user is standing, we need this for saving the translation preferences for each deck
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
     *      "from": "en",
     *      "audioSrc":"https://d32suzxs6u0rur.cloudfront.net/audio/TTS?lang=es&q=hola"
     *      }
     * @apiVersion 1.0.0
     *  */
    app.get("/translate/:deckId", controllerUtils.requireLogin, 
    [
        query('text','Text to translate must be between between 1 and 40 characters')
        .isLength({min:1, max:40}),
        
        param("deckId", "deckId must me a valid mongoid")
        .isMongoId(),

        query("from", "from language must be either undefined or a valid language iso code")
        .isLength({max:2}),

        query("to", "to language must be a valid language iso code")
        .isLength({min:2, max:2})
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
        dictionaryService.translate(req.userId, req.params.deckId, req.query.text, req.query.from, req.query.to, r=>{
            res.json(r);
        });
    });


        /**
     * @api {get} /translateUsedLangs/:deckId translate used langs
     * @apiGroup search
     * @apiName translate used langs
     * @apiDescription The last languages(from and to) the user used in the translator.
     * @apiParam {Param} {string} deckId id of the deck where the user is standing, we need this for saving the translation preferences for each deck
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {Parameter} Request-Example:
     * curl localhost:3000/translateUsedLangs
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "to": "es",
     *      "from": "en"
     *      }
     * @apiVersion 1.0.0
     *  */
    app.get("/translateUsedLangs/:deckId", controllerUtils.requireLogin,
    [
        param("deckId", "deckId must me a valid mongoid")
        .isMongoId()
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
        dictionaryService.getTranslatorLastLangs(req.userId, req.params.deckId)
        .then(r=>{
            return res.json({success:true, msg:r});
        }) 
    });
};