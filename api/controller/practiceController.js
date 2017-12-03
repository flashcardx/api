const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const practiceService = require(appRoot + "/service/practiceService");
const { check, param, query, body, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

/**
     * @api {get} /spCards spaced repetition cards
     * @apiGroup practice
     * @apiName spaced repetition cards
     * @apiDescription gets 8 cards that need sp practice for every card, it hides the card name!.
     * @apiParam (Query) {string} [deckId] id for specific deck you wanna practice
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /spCards?deckId=de4f5f2e50ffs4f5f5gg
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":"true",
     *       "cards": "[{"_id":"ASY54RFRF5TOJB1XW",
     *                  "name":"my awesome new card"
     *                  "description": "hello world",
     *                  "deckId": {"_id":"ed5er5edf4frfr5f4rff", "lang":"en"}
     *                  "imgs": [{"hash":"4f64b9842a75a917fb4581ab92850adc",
     *                             "width": "245",
     *                             "height":"324",
     *                             "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc"
     *                              },
     *                              {"hash":"4f64b9842a75a917fb4581ab92850ade",
     *                               "width": "234",
     *                                "height": "235",
     *                                 "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade"
     *                              }]},
     *              {"_id":"ASY54RFRFsasd5TOJB1XW",
     *                   "name": "cool stuff"
     *                  "description": "hello world2",
     *                  "deckId": {"_id":"ed5er5edf4frfr5f4rff", "lang":"en"},
     *                  "imgs": [{"hash":"4f64b9842a75a917fb4581ab92850adc",
     *                             "width": "245",
     *                             "height":"324",
     *                             "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc"
     *                              },
     *                              {"hash":"4f64b9842a75a917fb4581ab92850ade",
     *                               "width": "234",
     *                                "height": "235",
     *                                 "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade"
     *                              }]}]"
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/spCards", controllerUtils.requireLogin, 
            [query('deckId', 'deckId needs to be less than 24 characters')
            .isLength({max:24})],
            controllerUtils.checkValidatorErrors,
        (req, res)=>{
        practiceService.listCards(req.userId, req.query.deckId, result=>{
            return res.json(result);
        });
    });

    /**
     * @api {post} /rankCard rank card
     * @apiGroup practice
     * @apiName rank card
     * @apiDescription send name of the card, it'll rank your answer and update the metadata for sp practice, gives u points too.
     * @apiParam (Body) {string} cardId id for card you wanna rank
     * @apiParam (Body) {string} name name of the card (the user guessed this value) 
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /rankCard
     *  Body: {
     *          cardId: ed5e4de5d5rf4r5fr8frfrfr4f540fr,
     *          name: train     
     *  }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":"true",
     *      "rank": "5" ,
     *       "hit": "10"
     *       "points": "450"
     *      }
     * @apiVersion 1.1.0
     *  */
     app.post("/rankCard", [
         body("cardId", "Card id must be 24 characters long and is mandatory")
         .isLength({min:24, max:24}),

         body("name", "card name is required and must be less than 40 characters")
         .isLength({min:1, max:40})
        ], controllerUtils.checkValidatorErrors,
           controllerUtils.requireLogin, (req, res)=>{
                const userId = req.userId;
                const cardId = req.body.cardId;
                const name = req.body.name
                practiceService.rankCard(userId, cardId, name, result=>{
                    return res.json(result);
                });
        });

}