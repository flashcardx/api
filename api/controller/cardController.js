const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const purifier = require(appRoot + "/utils/purifier");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");
const classService = require(appRoot + "/service/class/classService");
const practiceCardsService = require(appRoot + "/service/practiceCardsService");
const { check, body, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

    /**
     * @api {get} /cards/:type/:deckId get cards
     * @apiGroup card
     * @apiName get cards
     * @apiDescription returns cards inside deck.
     * @apiParam (Parameters) {string} type u: deck in user. c: deck in class.
     * @apiParam (Parameters) {string} [deckId] id for the deck where the cards are. if undefined will return/search cards in all decks!
     * @apiParam (Query) {string} [classname] needed when type=c
     * @apiParam (Query) {string} [limit=12] limit how manny cards will be returned
     * @apiParam (Query) {string} [skip=0] used for pagination, how manny to skip? 
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
            skip: req.query.skip,
            limit: req.query.limit,
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
            case "u":  cardService.deleteCard(cardId, userId, r=>{
                            return res.json(r);               
                        });
                       break;
            case "c":  classService.deleteCard(classname, cardId, userId, r=>{
                            return res.json(r);
                        });
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
        const deckId = req.params.deckId;
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
     * @api {post} /card/:type/:deckId create card
     * @apiGroup card
     * @apiName create card
     * @apiDescription create card inside deck.
     * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
     * @apiParam (Parameters) {string} deckId id for the deck where card will be created.
     * @apiParam (Query) {string} [classname] If deck is in class, classname is required.
     * @apiParam (Body) {string} name card name.
     * @apiParam (Body) {string} [description] description for card.
     * @apiParam (Body) {Array} [imgs] Array with objects containing image hashes(Up to 3) and size(width and height), you need to call the image proxy method first for getting the hash.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /card/c/59991371065a2544f7c90288?classname=unlam1
     * body: { "name":"car",
     *          "description": "a ferrari",
     *          "hashes":["dcc6456deddddr", "4f5f8dddrfoklh4"]
     *      }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *      "card": {   
     *                  "_id":"ASY54RFRF5TOJB1XW"
     *                  "name": "car",
     *                  "description": "hello world",
     *                  "imgs": [{"hash":"sdeed653eded",
     *                            "width": "",
     *                             "height":""
     *                              },
     *                              {"hash":"defcrdef56r4f",
     *                               "width": "",
     *                                "height": ""}]
     *              }
     *      }
     * @apiVersion 1.1.0
     *  */
    app.post("/card/:type/:deckId", controllerUtils.requireLogin, 
    [
        check('name', 'Flashcard name must be at least 1 character long and less than 40 characters')
        .isLength({ min: 1, max:40}),
        check('description', 'Flashcard description must be less than 850 characters')
        .isLength({max:850}),
         check('imgs')
        .custom(imgs => {
            if(!Array.isArray(imgs))
                throw new Error("Imgs must be an array");
            if(imgs.length > 3)
                throw new Error("Card can not have more than 3 imgs");
            imgs.forEach((img1, index1)=>{
                imgs.forEach((img2, index2)=>{
                    if(index1 != index2)
                        if(img1.hash == img2.hash)
                            throw new Error('Yo can not have the same image twice in a flashcard');
                });
            });
            return true;
        })
    ], controllerUtils.checkValidatorErrors,
     (req, res)=>{
        if(!req.body.description && req.body.imgs.length == 0)
            return res.json({success:false, msg:"Card needs description or at least some multimedia content"});    
        var card = {
                name: purifier.purify(req.body.name),
                description: purifier.purify(req.body.description),
                imgs: req.body.imgs
             };
            var parameters = {
                card: card,
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
     * @api {post} /editCard/:type/:cardId edit card
     * @apiGroup card
     * @apiName edit card
     * @apiDescription edit card's data, *undefined values wont be updated.
     * @apiParam (Parameters) {string} type u:user, c:class.
     * @apiParam (Parameters) {string} cardId id of the card to be updated.
     * @apiParam (Query) {string} [classname] needed when type=c.
     * @apiParam (Request body) {string} [name] name for the card.
     * @apiParam (Request body) {string} [description] description for the card.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /editCard/u/59991371065a2544f7c90288
     * body: { "name":"car",
     *          "description": "a ferrari updated"
     *      }
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true,
     *       "card": {   
     *                  "_id":"ASY54RFRF5TOJB1XW"
     *                  "name": "car",
     *                  "description": "hello world",
     *                  "imgs": [{"hash":"sdeed653eded",
     *                            "width": "",
     *                             "height":""
     *                              },
     *                              {"hash":"defcrdef56r4f",
     *                               "width": "",
     *                                "height": ""}]
     *              }
     *      }
     * @apiVersion 1.1.0
     *  */
    app.post("/editCard/:type/:cardId", controllerUtils.requireLogin, [
        check('name', 'Flashcard name must be at least 1 character long and less than 40 characters')
        .isLength({ min: 1, max:40}),
        check('description', 'Flashcard description must be less than 850 characters')
        .isLength({max:850}),
        check("imgs")
        .custom(imgs=>{
            if(!Array.isArray(imgs))
                throw new Error("Imgs must be an array");
            if(imgs.length > 3)
                throw new Error("Card can not have more than 3 imgs");
            imgs.forEach((img1, index1)=>{
                imgs.forEach((img2, index2)=>{
                    if(index1 != index2)
                        if(img1.hash == img2.hash)
                            throw new Error('Yo can not have the same image twice in a flashcard');
                });
            });
            return true;
        })
    ], controllerUtils.checkValidatorErrors, (req, res)=>{
        if(!req.body.description && req.body.imgs.length == 0)
            return res.json({success:false, msg:"Card needs description or at least some multimedia content"});
        const cardId = req.params.cardId;
        const classname = req.query.classname;
        const userId = req.userId;
        const card = {
            name : purifier.purify(req.body.name),
            description : purifier.purify(req.body.description),
            imgs: req.body.imgs
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

     /**
     * @api {post} /moveCard/:cardId/:deckId move card
     * @apiGroup card
     * @apiName move card
     * @apiDescription move card to another deck, the same user must own both decks.
     * @apiParam (Parameters) {string} cardId: id of the card to be moved
     * @apiParam (Parameters) {string} deckId: id of the deck where the card will be moved.
     * @apiHeader (Headers) {string} x-access-token user session token
     * @apiParamExample {json} Request-Example:
     * url: /moveCard/59991371065a2544f7c90288/599sd37ds65a2df7c9dcdc8
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {"success":true
     *      }
     * @apiVersion 1.1.0
     *  */
    app.get("/moveCard/:cardId/:deckId", controllerUtils.requireLogin, (req, res)=>{
        const userId = req.userId;
        cardService.moveCard(userId, req.params.cardId, req.params.deckId, r=>{
                return res.json(r);
        });
    });

    app.get("/practiceCards", controllerUtils.requireLogin, (req, res)=>{
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