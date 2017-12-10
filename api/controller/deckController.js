const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const validator = require('validator');
const deckService = require(appRoot + "/service/deckService");
const { query, param, body, validationResult } = require('express-validator/check');
const controllerUtils = require(appRoot + "/middleware").utils;

module.exports = function(app){

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
 * @apiParam (Request body) {string} [img] Image object containing: hash, width,height. Will be shown in the deck cover.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/u
 * body: {
 *         "name":"people",
 *         "description": "beautiful people",
 *         "parentId": "5998f5ea23cbd123cf8becce",
 *         "lang": "en",
 *          "img":{
 *              "hash": "xsxedede",
 *              "width": "200",
 *              "height": "56"
 *              }
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "deck": {"description":"beautiful people in a deck",
                "img": {"hash": "f6a67762d80f968d2aa4f1d9e928981b",
                        "width": "968", "height": 605,
                        "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b"
                        },
                "lang":"en",
                "name":"people",
                "_id": "5a1b1633b6da91351c7694d9"
            }
 *      }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success": false,
 *       "msg": "some mongodb error"
 *     }
 * @apiVersion 1.1.0
 *  */
    app.post("/deck/:type", controllerUtils.requireLogin, 
        [
            param('type',"Card type's length must be in 1!")
            .isLength({min:1,max:1}),
            body('name', 'Flashcard name must be at least 1 character long and less than 40 characters')
            .isLength({ min: 1, max:40}),
            body('description', 'Flashcard description must be less than 850 characters')
            .isLength({max:850}),
            body('classname',"Classname length must be in between 1 and 40")
            .isLength({max: 40}),
            body('lang',  'Language Option must be length of 2')
            .isLength({min:2,max:2})
        ], controllerUtils.checkValidatorErrors,
    
        (req, res)=>{
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
app.delete("/deckImg/:type/:deckId", controllerUtils.requireLogin, 
    [
        param('type',"Card type's length must be in 1!")
        .isLength({min:1,max:1}),
        param('deckId','Deck ID must be a valid Mongo ID')
        .isMongoId(),
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
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
 * @api {post} /editDeck/:type/:deckId edit deck
 * @apiGroup deck
 * @apiName edit deck
 * @apiDescription edit name/description/language/image of the deck. *Only defined parameters will be updated.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Request body) {string} [name] name for the deck.
 * @apiParam (Request body) {string} [description] description for deck.
 * @apiParam (Request body) {string} [lang] Language code for the deck.
 * @apiParam (Request body) {string} [img] Image object containing: hash, width,height. Will be shown in the deck cover.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /editDeck/u/59991371065a2544f7c90288
 * body:  {
 *         "name":"people",
 *         "description": "beautiful people in a deck"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "deck": {"description":"beautiful people in a deck",
                "img": {"hash": "f6a67762d80f968d2aa4f1d9e928981b",
                        "width": "968", "height": 605,
                        "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b"
                        },
                "lang":"es",
                "name":"people",
                "_id": "5a1b1633b6da91351c7694d9"
            }
 *      }
 * @apiVersion 1.1.0
 *  */
app.post("/editDeck/:type/:deckId", controllerUtils.requireLogin,
    [
        param('type',"Card type's length must be in 1!")
        .isLength({min:1,max:1}),
        param('deckId','Deck ID must be a valid Mongo ID')
        .isMongoId(),
        body('name', 'Flashcard name must be at least 1 character long and less than 40 characters')
        .isLength({ min: 1, max:40}),
        body('description', 'Flashcard description must be less than 850 characters')
        .isLength({max:850}),
        body('lang')
        .custom(lang => {
            if(lang == null) return true;
            else{
                if(lang.length == 2){
                    return true;
                }else{
                    throw new Error('Lenght of Language must be 2!');
                }
            }
        })
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
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
app.delete("/deck/:type/:deckId", controllerUtils.requireLogin, 
    [
        param('type',"Card type's length must be in 1!")
        .isLength({min:1,max:1}),
        param('deckId','Deck ID must be a valid Mongo ID')
        .isMongoId(),
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
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
 *     {"success":"true"
 *      }
 * @apiVersion 1.1.0
 *  */
app.get("/duplicateDeck/:type/:deckIdSrc", controllerUtils.requireLogin, 
    [
        param('type',"Card type's length must be in 1!")
        .isLength({min:2,max:2}),
        param('deckIdSrc',"Deck ID source must be a valid Mongodb ID!")
        .isMongoId(),
        query('classname',"Classname length must be in between 1 and 40")
        .isLength({max: 40}),
        query('dest','Dest is optional but must be a valid Mongo ID if provided')
        .optional().isMongoId(),
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
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
    app.get("/alldecks/:type", controllerUtils.requireLogin, 
        [
            param('type',"Card type's length must be in 1!")
            .isLength({min:1,max:1}),
            query('classname',"Classname length must be in between 1 and 40")
            .isLength({max: 40}),
        ], controllerUtils.checkValidatorErrors,    
        (req, res)=>{
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
 * @apiDescription Returns all decks(name, id,description, lang and thumbnail) inside a deck, it uses pagination so once limit reached use skip for getting elements from other pages. decks per page:14.
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
 *      "decks": [{"description":"aaaa",
                    "img": {"hash": "f6a67762d80f968d2aa4f1d9e928981b",
                            "width": "968", "height": 605,
                            "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b"
                            },
                    "lang":"es",
                    "name":"aaa",
                    "_id": "5a1b1633b6da91351c7694d9"
                 },
 *                {"description":"A beaufitul thing",
                    "img": {"hash": "f6a67762d80f968d2aa4f1d9e928981b",
                            "width": "968", "height": 605,
                            "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b"
                            },
                    "lang":"es",
                    "name":"casa",
                    "_id": "5a1b1633b6da91351c7694d9"
                }]
 *      }
 * @apiVersion 1.1.0
 *  */
    app.get("/decks/:type", controllerUtils.requireLogin, 
        [
            param('type',"Card type's length must be in 1!")
            .isLength({min:1,max:1}),
            query('parentId')
            .custom(parentId => {
                if(parentId == null) return true;
                else{
                    if(validator.isMongoId(parentId)){
                        return true;
                    }else{
                        throw new Error('Parent Deck Id must be a valid MongoID');
                    }
                }
            }),
            query('skip')
            .custom(skip => {
                let skipValue = parseInt(skip);
                if(isNaN(skipValue) && skip != null){
                    throw new Error("Skip must be a number");
                }else{
                    if(skipValue >= 0 && skipValue < 10000){
                        return true;
                    }else{
                        throw new Error("Skip must be in between 0 and 9999");
                    }
                }
            }),
            query('classname',"Classname length must be in between 1 and 40")
            .isLength({max: 40}),
        ], controllerUtils.checkValidatorErrors,
        (req, res)=>{
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

/** 
 * @api {get} /deck/:deckId Get deck details
 * @apiGroup deck
 * @apiName Get decks details
 * @apiDescription Returns deck info based on query parameters.
 * @apiParam (Parameters) {string} deckId.
 * @apiParam (Query) {string} [fields] fields that you request from the deck
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /deck/59991371065a2544f7c9028c?fields=name
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "msg": {"description":"aaaa",
                "img": {"hash": "f6a67762d80f968d2aa4f1d9e928981b",
                        "width": "968", "height": 605,
                        "src": "https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b"
                        },
                "lang":"es",
                "name":"aaa",
                "_id": "5a1b1633b6da91351c7694d9"
            }
 *      }
 * @apiVersion 1.1.0
 *  */
app.get("/deck/:deckId", controllerUtils.requireLogin, 
    [
        param('deckId', 'deckId needs to be less than 24 characters')
        .isLength({ min: 12, max:24}),
        
        query('fields', 'fields characters limit between: 1 and 40')
        .isLength({ min: 1, max:40})
    ], controllerUtils.checkValidatorErrors,
    (req, res)=>{
        const fields = req.query.fields;
        logger.error("fields: ", fields);
        deckService.findByIdLean(req.userId, req.params.deckId, req.query.fields)
        .then(r=>{
            return res.json({success:true, msg:r});
        })
        .catch(err=>{
            return res.json({success:false, msg:err});
        })
    })


/**
 * @api {get} /decksName/:type/:deckId Get decks names and ids inside deck
 * @apiGroup deck
 * @apiName Get decks inside deck
 * @apiDescription Returns all decks(name, id) inside a deck, it has a limit of 50 objects, TODO: add pagination for returning more objects.
 * @apiParam (Parameters) {string} type u or c depending on if deck belongs to user or class.
 * @apiParam (Query) {string} [deckId] id of the parent deck, if not specified returns all decks in root.
 * @apiParam (Query) {string} [classname] needed when type=c.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /decks/u/59991371065a2544f7c9028c
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "decks": [{"name": "deck1", "_id":"59991371065a2544f7c90288"},
 *                {"name": "math", "_id":"59991371065a2544fasd8888"}]
 *      }
 * @apiVersion 1.1.0
 *  */
app.get("/decksName/:type", controllerUtils.requireLogin, 
    [
        param('type',"Card type's length must be in 1!")
        .isLength({min:1,max:1}),
        query('deckId', 'Deck Id must be a valid mongo id')
        .optional().isMongoId(),
    ], controllerUtils.checkValidatorErrors,    
    (req, res)=>{
            switch (req.params.type) {
                case "u":
                        deckService.listDeckName(req.userId, req.query.deckId, r=>{
                            return res.json(r);
                        })
                        break;
                default: return res.json({success:false, msg:"invalid type"}); 
            }
        });
}
