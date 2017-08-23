const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const deckService = require(appRoot + "/service/deckService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

/**
 * @api {post} /deck/:type new deck
 * @apiGroup deck
 * @apiName new deck
 * @apiDescription creates user or class deck depending on type param, returns id of new deck.
 * @apiParam (type) type u or c depending on if deck belongs to user or class.
 * @apiParam (deckbody) {string} name name for the deck.
 * @apiParam (deckbody) {string} description description for deck.
 * @apiParam (deckbody) {string} [classname] needed if deck will be for a class.
 * @apiParam (deckbody) {string} [parentid] required if new deck(child) is inside another deck(parent).
 * @apiHeader (accessToken) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/u
 *      {
 *         "name":"people",
 *         "description": "beautiful people",
 *         "parentid": "5998f5ea23cbd123cf8becce"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "id": "59991371065a2544f7c90288"
 *      }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success": false,
 *       "msg": "some mongodb error"
 *     }
 * @apiVersion 1.1.0
 *  */
    app.post("/deck/:type", controllerUtils.requireLogin, (req, res)=>{
        switch (req.params.type) {
            case "u":
                    deckService.create4User(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.create4Class(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
    });


/**
 * @api {post} /imageDeckFromUrl/:type imageDeckFromUrl
 * @apiGroup deck
 * @apiName imageDeckFromUrl
 * @apiDescription sets deck thumbnail from the url sent. if deck already has an image this one will be replaced with the new one.
 * @apiParam (type) type u or c depending on if deck belongs to user or class
 * @apiParam (deckbody) {string} deckId id of the deck.
 * @apiParam (deckbody) {string} url url for the image to download.
 * @apiHeader (accessToken) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /imageDeckFromUrl/u 
 *      {
 *         "url":"https://myimage.com/beauty.jpeg",
 *         "deckId": "5998f5ea23cbd123cf8becce"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.post("/imageDeckFromUrl/:type", (req, res)=>{
    switch (req.params.type) {
            case "u":
                    deckService.setImgUserDeckFromUrl(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.setImgClassDeckFromUrl(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});

/**
 * @api {post} /imageDeckFromBuffer/:type imageDeckFromBuffer
 * @apiGroup deck
 * @apiName imageDeckFromBuffer
 * @apiDescription sets deck thumbnail from the data sent. if deck already has an image this one will be replaced with the new one.
 * @apiParam (type) type u or c depending on if deck belongs to user or class
 * @apiParam (deckbody) {string} deckId id of the deck.
 * @apiParam (deckbody) {Buffer} img buffer containing the image.
 * @apiHeader (accessToken) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /imageDeckFromUrl/u 
 *      {
 *         "img": "{Buffer object}",
 *         "deckId": "5998f5ea23cbd123cf8becce"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.post("/imageDeckFromBuffer/:type", (req, res)=>{
    switch (req.params.type) {
            case "u":
                    deckService.setImgUserDeckFromBuffer(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.setImgClassDeckFromBuffer(req.userId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});

/**
 * @api {delete} /deckImg/:type/:deckId delete deck image
 * @apiGroup deck
 * @apiName delete deck image
 * @apiDescription deletes deck thumbnail.
 * @apiParam (type) type u or c depending on if deck belongs to user or class
 * @apiParam (deckId) {string} deckId id of the deck.
 * @apiHeader (accessToken) {string} x-access-token user session token.
 * @apiParamExample {json} Request-Example:
 * url: /deckImg/u/5998f5ea23cbd123cf8becce
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.delete("/deckImg/:type/:deckId", (req, res)=>{
    switch (req.params.type) {
            case "u":
                    deckService.deleteImgUserDeck(req.userId, req.params.deckId, r=>{
                        return res.json(r);
                    });
                    break;
            case "c":
                    deckService.deleteImgClassDeck(req.userId, req.params.deckId, r=>{
                        return res.json(r);
                    });
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});



//update name and description
//delete deck

}