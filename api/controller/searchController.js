const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const S = require("string");
const userService = require(appRoot + "/service/userService");
const dictionaryService = require(appRoot + "/service/dictionaryService");
const searchService = require(appRoot + "/service/searchService");
const { param} = require('express-validator/check');
const {validateLang} = require(appRoot +"/utils/validator");

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

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
    app.get("/searchGif/:q", controllerUtils.requireLogin, function(req,res){
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
     * @api {get} /textToSpeech/:lang/:text textToSPeech
     * @apiGroup search
     * @apiName textToSPeech
     * @apiDescription receives lang and text and returns URL for downloading audio file.
     * @apiParam (Parameters) {string} lang ISO 2 letter lang code.
     * @apiParam (Parameters) {string} Text to make speech of, max 40 characters NOTE: YOU MUST ENCODE THIS FIELD, CAUSE THIS IS PART OF THE URL, OTHERWISE CHARACERS LIKE '?' WILL GET LOOSE
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {Parameter} Request-Example:
     * curl localhost:3000/textToSpeech/es/holis
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":"true",
     *       "msg": "https://d2pkpj1gudc0wt.cloudfront.net/audio/eddrr7f8f8f7d4fg"
     *      }
     * @apiVersion 1.0.0
     *  */
    app.get('/textToSpeech/:lang/:text',
         controllerUtils.requireLogin,[
         param('text', 'text character limit reached')
        .isLength({ min: 1, max: 40 }),
        
         param("lang")
        .custom(lang=>{
                if(!validateLang(lang)){
                    logger.error("lang not valid: ", lang);
                    throw new Error("Lang is not valid");
                }
                return true;
        })
    ],
    controllerUtils.checkValidatorErrors,
    (req,res) => {
            searchService.textToSpeech(req.params.lang, decodeURIComponent(req.params.text), r=>{
                return res.json(r);
            });
    })
};