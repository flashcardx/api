const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const deckService = require(appRoot + "/service/deckService");
const credentials = config.AWSCredentials;

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

/**
 * @api {post} /deck/:type new deck
 * @apiGroup deck
 * @apiName new deck
 * @apiDescription creates user or class deck depending on type param, returns id of new deck.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Request body) {string} name name for the deck.
 * @apiParam (Request body) {string} description description for deck.
 * @apiParam (Request body) {string} [classname] needed if deck will be for a class.
 * @apiParam (Request body) {string} [parentId] required if new deck(child) is inside another deck(parent).
 * @apiParam (Request body) {string} [lang=en] Language code for the deck.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/u
 * body: {
 *         "name":"people",
 *         "description": "beautiful people",
 *         "parentId": "5998f5ea23cbd123cf8becce",
 *         "lang": "es"
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
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class
 * @apiParam (Request body) {string} deckId id of the deck.
 * @apiParam (Request body) {string} url url for the image to download.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /imageDeckFromUrl/u 
 * body: {
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
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class
 * @apiParam (Request body) {string} deckId id of the deck.
 * @apiParam (Request body) {Buffer} img buffer containing the image.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /imageDeckFromUrl/u 
 * body: {
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
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class
 * @apiParam (Parameters) {string} deckId id of the deck.
 * @apiHeader (Headers) {string} x-access-token user session token.
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


/**
 * @api {post} /updateDeck/:type/:deckId update deck
 * @apiGroup deck
 * @apiName update deck
 * @apiDescription update name/description/language of the deck. *Only defined parameters will be updated.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Request body) {string} [name] name for the deck.
 * @apiParam (Request body) {string} [description] description for deck.
 * @apiParam (Request body) {string} [lang] Language code for the deck.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /updateDeck/u/59991371065a2544f7c90288
 * body:  {
 *         "name":"people",
 *         "description": "beautiful people"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.post("/updateDeck/:type/:deckId", (req, res)=>{
    switch (req.params.type) {
            case "u":
                    deckService.update4User(req.userId, req.params.deckId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.update4Class(req.userId, req.params.deckId, req.body, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});

/**
 * @api {delete} /deck/:type/:deckId delete deck
 * @apiGroup deck
 * @apiName delete deck
 * @apiDescription If success=true deck including all its child decks and cards.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/u/59991371065a2544f7c90288
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.delete("/deck/:type/:deckId", (req, res)=>{
    switch (req.params.type) {
            case "u":
                    deckService.delete4User(req.userId, req.params.deckId, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.delete4Class(req.userId, req.params.deckId, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});

/**
 * @api {get} /alldecks/:type Get all decks
 * @apiGroup deck
 * @apiName Get all decks
 * @apiDescription Returns all decks(name and id) from user or class.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Query) {string} [classname] Needed for getting class decks.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /decks/u
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "decks": [{"name": "deck1", id:"59991371065a2544f7c90288"},
 *                {"name": "math", id:"59991371065a2544fasd8888"}]
 *      }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success": false,
 *       "msg": "some mongodb error"
 *     }
 * @apiVersion 1.1.0
 *  */
    app.get("/alldecks/:type", controllerUtils.requireLogin, (req, res)=>{
        switch (req.params.type) {
            case "u":
                    deckService.allUserDecks(req.userId, r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.allClassDecks(req.userId, req.query.classname, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});

/**
 * @api {get} /deckschildren/:type Get decks inside deck
 * @apiGroup deck
 * @apiName Get decks inside deck
 * @apiDescription Returns all decks(name, id and thumbnail) inside a deck, it uses pagination so once limit reached use skip for getting elements from other pages. Note:For getting the final img url you need to concatenate the thumbnail hash you get with the imgBaseUrl parameter that this endpoint will return.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Query) {string} [parentId] id of the parent deck, if not specified returns all decks in root.
 * @apiParam (Query) {string} [classname] needed when type=c.
 * @apiParam (Query) {string} [skip=0] Used for pagination, if every page has 14 items, when skip=14 you will get items from page 2.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deckschildren/u?parentId=59991371065a2544f7c9028c&skip=14
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "decks": [{"name": "deck1", id:"59991371065a2544f7c90288", "thumbnail":"18428b0dd352776131a209bd24785b8f"},
 *                {"name": "math", id:"59991371065a2544fasd8888", "thumbnail":"18428b0dd352776131a209bd24785b8f"}],
 *      "imgBaseUrl": "https://d32suzxs6u0rur.cloudfront.net"
 *      }
 * @apiVersion 1.1.0
 *  */
    app.get("/deckschildren/:type", controllerUtils.requireLogin, (req, res)=>{
        switch (req.params.type) {
            case "u":
                    deckService.childUserDecks(req.userId, req.query.parentId, req.query.skip, r=>{
                        if(r.success == true)
                            r.imgBaseUrl = credentials.cloudfrontUrl;
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.childClassDecks(req.userId, req.query.parentId, req.query.classname, req.query.skip, r=>{
                        if(r.success == true)
                            r.imgBaseUrl = credentials.cloudfrontUrl;  
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});



}
