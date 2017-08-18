const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const purifier = require(appRoot + "/utils/purifier");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");
const practiceCardsService = require(appRoot + "/service/practiceCardsService");


module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/card", controllerUtils.requireLogin, function(req, res){
            var card = {
                name: purifier.purify(req.body.name),
                description: purifier.purify(req.body.description),
                category:  purifier.purify(req.body.category)
            };
            cardService.createCard(card, req.body.imgs, req.userId,function(result){
                res.json(result);
            });
    } );

    app.get("/myCards", controllerUtils.requireLogin, function(req, res){
        var params = {
            last: req.query.last,
            limit: req.query.limit,
            category: req.query.category,
            sort: req.query.sort,
            name: req.query.q
        };
        cardService.getCards(req.userId, params, function(result){
            res.json(result);
        });
    });

    app.get("/allCards" , function(req, res){
        var last = req.query.last;
        cardService.getAllCards(last, function(result){
            res.json(result);
        });
    });

    app.get("/discoverCards", controllerUtils.requireLogin, function(req, res){
        var last = req.query.last;
        cardService.cardRecommendations(req.userId, last , result=>{
            res.json(result);
        });
    });
  
    app.delete("/card/:id", controllerUtils.requireLogin, (req, res)=>{
        const id = req.params.id;
        cardService.deleteCard(id, req.userId, function(result){
            logger.error("DELETE CARD RESULT: " + JSON.stringify(result.msg));
            res.json(result);
        });
    });

    app.get("/duplicateCard/:id", controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.id;
        cardService.duplicateCard2User(req.userId, cardId, result=>{
            res.json(result);
        });
    });

    app.post("/updateCard/:cardId",  controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.cardId;
        const userId = req.userId;
        const card ={
            name : purifier.purify(req.body.name),
            description : purifier.purify(req.body.description),
            category: purifier.purify(req.body.category)
        }
        cardService.updateCard(cardId, userId, card, r=>{
            return res.json(r);
        });

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