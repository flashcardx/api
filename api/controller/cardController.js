const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Cards = require(appRoot + "/models/cardModel");
const cardService = require(appRoot + "/service/cardService");


module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/card", controllerUtils.requireLogin, function(req, res){
            var card = {
                name: req.body.name,
                description: req.body.description,
            };
            cardService.createCard(card, req.body.imgs, req.userId,function(result){
                res.json(result);
            });
    } );

    app.get("/myCards", controllerUtils.requireLogin, function(req, res){
        var last = req.query.last;
        var limit = req.query.limit;
        cardService.getCards(req.userId, last, limit,  function(result){
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
            res.json(result);
        });
    });

    app.get("/duplicateCard/:id", controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.id;
        cardService.duplicateCard(req.userId, cardId, result=>{
            res.json(result);
        });
    });

};