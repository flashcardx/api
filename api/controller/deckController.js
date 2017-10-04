const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const deckService = require(appRoot + "/service/deckService");

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

/**
 * @api {post} /deck/:type new deck
 * @apiGroup deck
 * @apiName new deck
 * @apiDescription creates user or class deck depending on type param, returns the new deck.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Request body) {string} name name for the deck.
 * @apiParam (Request body) {string} description description for deck.
 * @apiParam (Request body) {string} [classname] needed if deck will be for a class.
 * @apiParam (Request body) {string} [parentId] required if new deck(child) is inside another deck(parent).
 * @apiParam (Request body) {string} [lang=en] Language code for the deck.
 * @apiParam (Request body) {string} [thumbnail] Image object containing: hash, width,height,x,y. Will be shown in the deck cover.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/u
 * body: {
 *         "name":"people",
 *         "description": "beautiful people",
 *         "parentId": "5998f5ea23cbd123cf8becce",
 *         "lang": "es",
 *          "thumbnail":{
 *              "hash": "xsxedede",
 *              "width": "200",
 *              "height": "56",
 *              "x": "0",
 *              "y": "0"    
 *              }
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "deck": {"_id":xxxxx, "name":"name", lang:"xxse", etc}
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
app.post("/imageDeckFromUrl/:type", controllerUtils.requireLogin, (req, res)=>{
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
app.post("/imageDeckFromBuffer/:type", controllerUtils.requireLogin, (req, res)=>{
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
app.delete("/deckImg/:type/:deckId", controllerUtils.requireLogin, (req, res)=>{
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
 *         "description": "beautiful people in a deck"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.post("/updateDeck/:type/:deckId", controllerUtils.requireLogin, (req, res)=>{
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
app.delete("/deck/:type/:deckId", controllerUtils.requireLogin, (req, res)=>{
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
 * @api {get} /duplicateDeck/:type/:deckIdSrc duplicate deck
 * @apiGroup deck
 * @apiName duplicate deck
 * @apiDescription duplicates deck to other deck, or root path of user/class.
 * @apiParam (Parameters) {string} type 2u: duplicates to user(from class or other user), 2c: to class(from user or other class where user has access).
 * @apiParam (Parameters) {string} deckIdSrc id of deck to be duplicated
 * @apiParam (Query) {string} [dest] id for the deck of destiny, if not specified deck will go to the root
 * @apiParam (Query) {string} [classname] needed if type=2c
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /duplicateDeck/2u/59991371065a2544f7c90288?dest=59991371065a2544f7c90288
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true
 *      }
 * @apiVersion 1.1.0
 *  */
app.get("/duplicateDeck/:type/:deckIdSrc", controllerUtils.requireLogin, (req, res)=>{
    switch (req.params.type) {
            case "2c": deckService.duplicate2Class(req.userId, req.query.classname, req.params.deckIdSrc, req.query.dest, r=>{
                            return res.json(r);
                    });
                    break;
            case "2u":
                    deckService.duplicate2User(req.userId, req.params.deckIdSrc, req.query.dest, r=>{
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
 * url: /alldecks/u
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
 * @api {get} /decks/:type Get decks inside deck
 * @apiGroup deck
 * @apiName Get decks inside deck
 * @apiDescription Returns all decks(name, id,description, lang and thumbnail) inside a deck, it uses pagination so once limit reached use skip for getting elements from other pages. decks per page:14. Note:For getting the final img url you need to concatenate the thumbnail hash you get with the CDN base url.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Query) {string} [parentId] id of the parent deck, if not specified returns all decks in root.
 * @apiParam (Query) {string} [classname] needed when type=c.
 * @apiParam (Query) {string} [skip=0] Used for pagination, if every page has 14 items, when skip=14 you will get items from page 2.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /decks/u?parentId=59991371065a2544f7c9028c&skip=14
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "decks": [{"description":"a very nice deck", "name": "deck1", id:"59991371065a2544f7c90288", "thumbnail":"18428b0dd352776131a209bd24785b8f", "lang": "es"},
 *                {"description":"a nice deck","name": "math", id:"59991371065a2544fasd8888", "thumbnail":"18428b0dd352776131a209bd24785b8f", "lang": "en"}]
 *      }
 * @apiVersion 1.1.0
 *  */
    app.get("/decks/:type", controllerUtils.requireLogin, (req, res)=>{
        switch (req.params.type) {
            case "u":
                    deckService.childUserDecks(req.userId, req.query.parentId, parseInt(req.query.skip), r=>{
                        return res.json(r);
                    })
                    break;
            case "c":
                    deckService.childClassDecks(req.userId, req.query.parentId, req.query.classname, req.query.skip, r=>{
                        return res.json(r);
                    })
                    break;
            default: return res.json({success:false, msg:"invalid type"}); 
        }
});



}
