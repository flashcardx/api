const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const purifier = require(appRoot + "/utils/purifier");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");
const classService = require(appRoot + "/service/class/classService");
const practiceCardsService = require(appRoot + "/service/practiceCardsService");

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

    /**
     * @api {post} /card/:type/:deckId create card
     * @apiGroup card
     * @apiName create card
     * @apiDescription create card inside deck.
     * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
     * @apiParam (Parameters) {string} deckId id for the deck where card will be created.
     * @apiParam (Query) {string} [classname] If deck is in class, classname is required.
     * @apiParam (Body) {string} name card name.
     * @apiParam (Body) {string} [description] description for card.
     * @apiParam (Body) {Array} [imgs] Array with either image url or buffer, max 3 images supported.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /card/c/59991371065a2544f7c90288?classname=unlam1
     * body: { "name":"car",
     *          "description": "a ferrari"
     *      }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true
     *      }
     * @apiVersion 1.1.0
     *  */
    app.post("/card/:type/:deckId", controllerUtils.requireLogin, function(req, res){
            var card = {
                name: purifier.purify(req.body.name),
                description: purifier.purify(req.body.description)
             };
            var parameters = {
                card: card,
                imgs: req.body.imgs,
                userId: req.userId,
                deckId: req.params.deckId
            };
            switch (req.params.type){
                case "u": cardService.createUserCard(parameters, result=>{
                            res.json(result);
                        });
                        break;
                case "c": cardService.createClassCard(parameters, req.query.classname, result=>{
                            res.json(result);
                         });
                         break;
                default: return res.json({success:false, msg:"invalid type"}); 
            }
    });



    /**
     * @api {get} /cards/:type/:deckId get cards
     * @apiGroup card
     * @apiName get cards
     * @apiDescription returns cards inside deck.
     * @apiParam (Parameters) {string} type u: deck in user. c: deck in class.
     * @apiParam (Parameters) {string} [deckId] id for the deck where the cards are. if undefined will return/search cards in all decks!
     * @apiParam (Query) {string} [classname] needed when type=c
     * @apiParam (Query) {string} [limit=12] limit how manny cards will be returned
     * @apiParam (Query) {string} [sort=asc] sort asc or deck, sorts cards by last update date 
     * @apiParam (Query) {string} [last] last for pagination needs 'updated_at' parameter of the last card listed 
     * @apiParam (Query) {string} [name] name send this parameter for searching by card name(reg expressions accepted)
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /cards/u/59991371065a2544f7c90288?limit=10
     * 
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "msg": [{"_id":"59a5c98fb2ec6536aa422456","updated_at":"2017-08-29T20:07:43.325Z","name":"card class","description":"I can fly in a class","imgs":[]}]
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/cards/:type/:deckId", controllerUtils.requireLogin, function(req, res){
        var params = {
            last: req.query.last,
            limit: req.query.limit,
            sort: req.query.sort,
            name: req.query.q,
            deckId: req.params.deckId
        };
        switch (req.params.type){
                case "u": cardService.getCards(req.userId, params, function(result){
                            res.json(result);
                          });
                        break;
                case "c": classService.getCards(req.query.classname, req.userId, params, function(result){
                            res.json(result);
                          });
                         break;
                default: return res.json({success:false, msg:"invalid type"}); 
            }
    });

    /**
     * @api {delete} /card/:type/:cardId delete card
     * @apiGroup card
     * @apiName delete card
     * @apiDescription deletes the card.
     * @apiParam (Parameters) {string} type u:user card, c:class card.
     * @apiParam (Parameters) {string} cardId id of the card to be deleted.
     * @apiParam (Query) {string} [classname] needed when type=c.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /card/u/59991371065a2544f7c90288
     * 
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true
     *      }
     * @apiVersion 1.1.0
     *  */
    app.delete("/card/:type/:cardId", controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.cardId;
        const type = req.params.type;
        const userId = req.userId;
        const classname = req.query.classname;
        switch (type) {
            case "u":  cardService.deleteCard(cardId, userId);
                       break;
            case "c":  classService.deleteCard(classname, cardId, userId);
                       break;
            default: res.json({success:false, msg:"invalid type"});
                    break;
        }
    });

    /**
     * @api {get} /duplicateCard/:type/:cardId/:deckId duplicate card
     * @apiGroup card
     * @apiName duplicate card
     * @apiDescription duplicates card from user to user.
     * @apiParam (Parameters) {string} type uu:user to user, uc:user to class, cu: class to user.
     * @apiParam (Parameters) {string} cardId id of the card to be duplicated.
     * @apiParam (Parameters) {string} deckId id for the deck where card will be created.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /duplicateCard/uu/59991371065a2544f7c90288/59991371065a2544f7c9028a
     * 
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/duplicateCard/:type/:cardId/:deckId", controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.id;
        const deckId = req.params.id;
        switch (req.params.type){
                    case "uu": cardService.duplicateCardUU(req.userId, cardId, deckId, result=>{
                                    res.json(result);
                                });
                                break;
                    case "uc": classService.duplicateCardUC(req.userId, cardId, deckId, result=>{
                                    res.json(result);
                                });
                                break;
                    case "cu": classService.duplicateCardCU(req.userId, cardId, deckId, result=>{
                                    res.json(result);
                                });
                               break;
                    default: return res.json({success:false, msg: "invalid type"});
                }
    });

     /**
     * @api {post} /updateCard/:type/:cardId update card
     * @apiGroup card
     * @apiName update card
     * @apiDescription updates card's name and description, *undefined values wont be updated.
     * @apiParam (Parameters) {string} type u:user, c:class.
     * @apiParam (Parameters) {string} cardId id of the card to be updated.
     * @apiParam (Query) {string} [classname] needed when type=c.
     * @apiParam (Request body) {string} [name] name for the card.
     * @apiParam (Request body) {string} [description] description for the card.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /updateCard/u/59991371065a2544f7c90288
     * body: { "name":"car",
     *          "description": "a ferrari updated"
     *      }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true
     *      }
     * @apiVersion 1.1.0
     *  */
    app.post("/updateCard/:type/:cardId",  controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.cardId;
        const classname = req.query.classname;
        const userId = req.userId;
        const card = {
            name : purifier.purify(req.body.name),
            description : purifier.purify(req.body.description)
        }
        switch (req.params.type){
                case "u": cardService.updateCard(cardId, userId, card, r=>{
                                return res.json(r);
                         });
                        break;
                case "c":  classService.updateCard(classname, userId, cardId, card, r=>{
                                return res.json(r);
                            });
                         break;
                default: return res.json({success:false, msg:"invalid type"}); 
            }
    });

    app.get("/practiceCards",  controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        practiceCardsService.listCards(userId, result=>{
            return res.json(result);
        });
    });

     app.post("/rankCard/:cardId", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        const cardId = req.params.cardId;
        practiceCardsService.rankCard(userId, cardId, req.body.addDays, result=>{
            return res.json(result);
        });
    });

};