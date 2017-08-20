const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const deckService = require(appRoot + "/service/deckService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

/**
 * @api {deck} /userdeck userdeck
 * @apiGroup deck
 * @apiName create user deck
 * @apiDescription creates user deck.
 * @apiParam (deckbody) {string} name name for the deck.
 * @apiParam (deckbody) {string} description description for deck.
 * @apiHeader (accessToken) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 *      {
 *         "name":"people",
 *         "description": "beautiful people",
 *         "parentdeckid": "5998f5ea23cbd123cf8becce"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success": false,
 *       "msg": "some mongodb error"
 *     }
 * @apiVersion 1.1.0
 *  */
    app.post("/userdeck", controllerUtils.requireLogin, (req, res)=>{
        deckService.create4User(req.userId, req.body, r=>{
            return res.json(r);
        })
    });
}