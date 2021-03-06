define({ "api": [
  {
    "type": "post",
    "url": "/card/:type/:deckId",
    "title": "create card",
    "group": "card",
    "name": "create_card",
    "description": "<p>create card inside deck.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id for the deck where card will be created.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>If deck is in class, classname is required.</p>"
          }
        ],
        "Body": [
          {
            "group": "Body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>card name.</p>"
          },
          {
            "group": "Body",
            "type": "string",
            "optional": true,
            "field": "description",
            "description": "<p>description for card.</p>"
          },
          {
            "group": "Body",
            "type": "Array",
            "optional": true,
            "field": "imgs",
            "description": "<p>Array with objects containing image hashes(Up to 3) and size(width and height), you need to call the image proxy method first for getting the hash.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /card/c/59991371065a2544f7c90288?classname=unlam1\nbody: { \"name\":\"car\",\n         \"description\": \"a ferrari\",\n         \"hashes\":[\"dcc6456deddddr\", \"4f5f8dddrfoklh4\"]\n     }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"card\": {   \n             \"_id\":\"ASY54RFRF5TOJB1XW\"\n             \"name\": \"car\",\n             \"description\": \"hello world\",\n             \"imgs\": [{\"hash\":\"4f64b9842a75a917fb4581ab92850adc\",\n                       \"width\": \"23\",\n                        \"height\":\"324\",\n                         \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc\"\n                         },\n                         {\"hash\":\"4f64b9842a75a917fb4581ab92850ade\",\n                          \"width\": \"234\",\n                           \"height\": \"235\",\n                            \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade\"\n                         }]\n         }\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/cardController.js",
    "groupTitle": "card"
  },
  {
    "type": "delete",
    "url": "/card/:type/:cardId",
    "title": "delete card",
    "group": "card",
    "name": "delete_card",
    "description": "<p>deletes the card.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u:user card, c:class card.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "cardId",
            "description": "<p>id of the card to be deleted.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed when type=c.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /card/u/59991371065a2544f7c90288",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/cardController.js",
    "groupTitle": "card"
  },
  {
    "type": "post",
    "url": "/editCard/:type/:cardId",
    "title": "edit card",
    "group": "card",
    "name": "edit_card",
    "description": "<p>edit card's data, *undefined values wont be updated.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u:user, c:class.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "cardId",
            "description": "<p>id of the card to be updated.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed when type=c.</p>"
          }
        ],
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "name",
            "description": "<p>name for the card.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "description",
            "description": "<p>description for the card.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /editCard/u/59991371065a2544f7c90288\nbody: { \"name\":\"car\",\n         \"description\": \"a ferrari updated\"\n     }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n  \"card\": {   \n             \"_id\":\"ASY54RFRF5TOJB1XW\",\n             \"name\": \"car\",\n             \"description\": \"hello world\",\n             \"imgs\": [{\"hash\":\"4f64b9842a75a917fb4581ab92850adc\",\n                        \"width\": \"245\",\n                        \"height\":\"324\",\n                        \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc\"\n                         },\n                         {\"hash\":\"4f64b9842a75a917fb4581ab92850ade\",\n                          \"width\": \"234\",\n                           \"height\": \"235\",\n                            \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade\"\n                         }]\n         }\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/cardController.js",
    "groupTitle": "card"
  },
  {
    "type": "get",
    "url": "/cards/:type/:deckId",
    "title": "get cards",
    "group": "card",
    "name": "get_cards",
    "description": "<p>returns cards inside deck.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u: deck in user. c: deck in class.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": true,
            "field": "deckId",
            "description": "<p>id for the deck where the cards are. if undefined will return/search cards in all decks!</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed when type=c</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "limit",
            "defaultValue": "12",
            "description": "<p>limit how manny cards will be returned</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>used for pagination, how manny to skip?</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "name",
            "description": "<p>name send this parameter for searching by card name(reg expressions accepted)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /cards/u/59991371065a2544f7c90288?limit=10",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"msg\": [{\"_id\":\"59a5c98fb2ec6536aa422456\",\"updated_at\":\"2017-08-29T20:07:43.325Z\",\"name\":\"card class\",\"description\":\"I can fly in a class\",\"imgs\":[]}]\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/cardController.js",
    "groupTitle": "card"
  },
  {
    "type": "post",
    "url": "/moveCard/:cardId/:deckId",
    "title": "move card",
    "group": "card",
    "name": "move_card",
    "description": "<p>move card to another deck, the same user must own both decks.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "cardId:",
            "description": "<p>id of the card to be moved</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckId:",
            "description": "<p>id of the deck where the card will be moved.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /moveCard/59991371065a2544f7c90288/599sd37ds65a2df7c9dcdc8",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":\"true\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/cardController.js",
    "groupTitle": "card"
  },
  {
    "type": "get",
    "url": "/alldecks/:type",
    "title": "Get all decks",
    "group": "deck",
    "name": "Get_all_decks",
    "description": "<p>Returns all decks(name and id) from user or class.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>Needed for getting class decks.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /alldecks/u",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"decks\": [{\"name\": \"deck1\", id:\"59991371065a2544f7c90288\"},\n           {\"name\": \"math\", id:\"59991371065a2544fasd8888\"}]\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\": false,\n  \"msg\": \"some mongodb error\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "get",
    "url": "/deck/:deckId",
    "title": "Get deck details",
    "group": "deck",
    "name": "Get_decks_details",
    "description": "<p>Returns deck info based on query parameters.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckId.",
            "description": ""
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "fields",
            "description": "<p>fields that you request from the deck</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deck/59991371065a2544f7c9028c?fields=name",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"msg\": {\"description\":\"aaaa\",\n            \"img\": {\"hash\": \"f6a67762d80f968d2aa4f1d9e928981b\",\n                    \"width\": \"968\", \"height\": 605,\n                    \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b\"\n                    },\n            \"lang\":\"es\",\n            \"name\":\"aaa\",\n            \"_id\": \"5a1b1633b6da91351c7694d9\"\n        }\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "get",
    "url": "/decks/:type",
    "title": "Get decks inside deck",
    "group": "deck",
    "name": "Get_decks_inside_deck",
    "description": "<p>Returns all decks(name, id,description, lang and thumbnail) inside a deck, it uses pagination so once limit reached use skip for getting elements from other pages. decks per page:14.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "parentId",
            "description": "<p>id of the parent deck, if not specified returns all decks in root.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed when type=c.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>Used for pagination, if every page has 14 items, when skip=14 you will get items from page 2.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /decks/u?parentId=59991371065a2544f7c9028c&skip=14",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"decks\": [{\"description\":\"aaaa\",\n                \"img\": {\"hash\": \"f6a67762d80f968d2aa4f1d9e928981b\",\n                        \"width\": \"968\", \"height\": 605,\n                        \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b\"\n                        },\n                \"lang\":\"es\",\n                \"name\":\"aaa\",\n                \"_id\": \"5a1b1633b6da91351c7694d9\"\n             },\n           {\"description\":\"A beaufitul thing\",\n                \"img\": {\"hash\": \"f6a67762d80f968d2aa4f1d9e928981b\",\n                        \"width\": \"968\", \"height\": 605,\n                        \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b\"\n                        },\n                \"lang\":\"es\",\n                \"name\":\"casa\",\n                \"_id\": \"5a1b1633b6da91351c7694d9\"\n            }]\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "get",
    "url": "/decksName/:type/:deckId",
    "title": "Get decks names and ids inside deck",
    "group": "deck",
    "name": "Get_decks_inside_deck",
    "description": "<p>Returns all decks(name, id) inside a deck, it has a limit of 50 objects, TODO: add pagination for returning more objects.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "deckId",
            "description": "<p>id of the parent deck, if not specified returns all decks in root.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed when type=c.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /decks/u/59991371065a2544f7c9028c",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"decks\": [{\"name\": \"deck1\", \"_id\":\"59991371065a2544f7c90288\"},\n           {\"name\": \"math\", \"_id\":\"59991371065a2544fasd8888\"}]\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "delete",
    "url": "/deck/:type/:deckId",
    "title": "delete deck",
    "group": "deck",
    "name": "delete_deck",
    "description": "<p>If success=true deck including all its child decks and cards.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deck/u/59991371065a2544f7c90288",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "delete",
    "url": "/deckImg/:type/:deckId",
    "title": "delete deck image",
    "group": "deck",
    "name": "delete_deck_image",
    "description": "<p>deletes deck thumbnail.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id of the deck.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deckImg/u/5998f5ea23cbd123cf8becce",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "get",
    "url": "/duplicateDeck/:type/:deckIdSrc",
    "title": "duplicate deck",
    "group": "deck",
    "name": "duplicate_deck",
    "description": "<p>duplicates deck to other deck, or root path of user/class.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>2u: duplicates to user(from class or other user), 2c: to class(from user or other class where user has access).</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckIdSrc",
            "description": "<p>id of deck to be duplicated</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "dest",
            "description": "<p>id for the deck of destiny, if not specified deck will go to the root</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed if type=2c</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /duplicateDeck/2u/59991371065a2544f7c90288?dest=59991371065a2544f7c90288",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":\"true\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "post",
    "url": "/editDeck/:type/:deckId",
    "title": "edit deck",
    "group": "deck",
    "name": "edit_deck",
    "description": "<p>edit name/description/language/image of the deck. *Only defined parameters will be updated.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ],
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "name",
            "description": "<p>name for the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "description",
            "description": "<p>description for deck, maxLenght:400 characters.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "lang",
            "description": "<p>Language code for the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "img",
            "description": "<p>Image object containing: hash, width,height. Will be shown in the deck cover.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /editDeck/u/59991371065a2544f7c90288\nbody:  {\n        \"name\":\"people\",\n        \"description\": \"beautiful people in a deck\"\n   }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"deck\": {\"description\":\"beautiful people in a deck\",\n            \"img\": {\"hash\": \"f6a67762d80f968d2aa4f1d9e928981b\",\n                    \"width\": \"968\", \"height\": 605,\n                    \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b\"\n                    },\n            \"lang\":\"es\",\n            \"name\":\"people\",\n            \"_id\": \"5a1b1633b6da91351c7694d9\"\n        }\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "post",
    "url": "/deck/:type",
    "title": "new deck",
    "group": "deck",
    "name": "new_deck",
    "description": "<p>creates user or class deck depending on type param, returns the new deck.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class.</p>"
          }
        ],
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>name for the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "description",
            "description": "<p>description for deck, maxLenght:400 characters..</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed if deck will be for a class.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "parentId",
            "description": "<p>required if new deck(child) is inside another deck(parent).</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "lang",
            "defaultValue": "en",
            "description": "<p>Language code for the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "img",
            "description": "<p>Image object containing: hash, width,height. Will be shown in the deck cover.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deck/u\nbody: {\n        \"name\":\"people\",\n        \"description\": \"beautiful people\",\n        \"parentId\": \"5998f5ea23cbd123cf8becce\",\n        \"lang\": \"en\",\n         \"img\":{\n             \"hash\": \"xsxedede\",\n             \"width\": \"200\",\n             \"height\": \"56\"\n             }\n   }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"deck\": {\"description\":\"beautiful people in a deck\",\n            \"img\": {\"hash\": \"f6a67762d80f968d2aa4f1d9e928981b\",\n                    \"width\": \"968\", \"height\": 605,\n                    \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2Ff6a67762d80f968d2aa4f1d9e928981b\"\n                    },\n            \"lang\":\"en\",\n            \"name\":\"people\",\n            \"_id\": \"5a1b1633b6da91351c7694d9\"\n        }\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\": false,\n  \"msg\": \"some mongodb error\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/deckController.js",
    "groupTitle": "deck"
  },
  {
    "type": "post",
    "url": "/imageProxy",
    "title": "Image proxy",
    "group": "image",
    "name": "Image_proxy",
    "description": "<p>recives dimentions and url or buffer of the image, saves it and returns hash(if concatenated with CDN url you get the image url) you must either send data or url parameters in the body. but never both.</p>",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "data",
            "description": "<p>buffer with image data for saving URL FORM ENCODED!! CHECK HOW WEB DEALS WITH IT.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "url",
            "description": "<p>image url for downloading.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /imageProxy\nbody: {\n        \"src\":\"www.example.com/img.jpg\"\n   }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"hash\": \"599dae000df00e4588f5ea23cbd123cf8becce\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/imgController.js",
    "groupTitle": "image"
  },
  {
    "type": "post",
    "url": "/fbAuth",
    "title": "fbAuth",
    "group": "login",
    "name": "fbAuth",
    "description": "<p>receives facebook access token, if credentials are ok returns auth token for the user, if user doesnt exist it creates the user first and returns token.</p>",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "action-token",
            "description": "<p>facebook access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\"success\":true,\n    \"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "controller/loginController.js",
    "groupTitle": "login"
  },
  {
    "type": "post",
    "url": "/googleAuth",
    "title": "googleAuth",
    "group": "login",
    "name": "googleAuth",
    "description": "<p>receives Google access token, if credentials are ok returns auth token for the user, if user doesn't exist it creates the user first and returns token.</p>",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "id_token",
            "description": "<p>google access token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\"success\":true,\n    \"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "controller/loginController.js",
    "groupTitle": "login"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "login",
    "group": "login",
    "name": "login",
    "description": "<p>receives user email and password and returns token with userid encrypted in it. note: the client can see the userid easily since getting the real data in the token is really easy, but setting data in a token is impossible(thanks to secret) ;).</p>",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>user email.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>user password.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "g-recaptcha-response",
            "description": "<p>recaptcha token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "  {\n     \"email\":\"pablo1234@gmail.com\",\n     \"password\": \"1234\",\n     \"g-recaptcha-response\": \"abc124xsed4fr\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\"success\":true,\n    \"token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":false,\n  \"msg\":\"invalid email or password\"\n}",
          "type": "json"
        }
      ],
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "errorCodes-login",
            "description": "<p><code>2</code> User does not exist</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "controller/loginController.js",
    "groupTitle": "login"
  },
  {
    "type": "post",
    "url": "/signup",
    "title": "signup",
    "group": "login",
    "name": "signup",
    "description": "<p>receives new user info and recaptcha code. generates temporal user(lasts 24hs) until user is validated by email</p>",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>can not exist other user with same email.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>user name.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>user password.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "lang",
            "defaultValue": "en",
            "description": "<p>language shortcode</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "g-recaptcha-response",
            "description": "<p>recaptcha token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "  {\n     \"email\":\"pablo1234@gmail.com\",\n     \"name\": \"pablo marino\",\n     \"password\": \"1234\",\n     \"lang\": \"en\",\n     \"g-recaptcha-response\": \"abc124xsed4fr\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"msg\":\"confirmation email was sent to the user pablo marino, check your spam folder!\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":false,\n  \"msg\":\"User already exists\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "controller/loginController.js",
    "groupTitle": "login"
  },
  {
    "type": "get",
    "url": "/cardCount",
    "title": "count all cards",
    "group": "master",
    "name": "count_all_cards",
    "description": "<p>returns the count for all the cards in the system.</p>",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Master user session token</p>"
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /cardCount",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"count\": 456788\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/masterController.js",
    "groupTitle": "master"
  },
  {
    "type": "get",
    "url": "/userCount",
    "title": "count all users",
    "group": "master",
    "name": "count_all_users",
    "description": "<p>returns the count for all the users in the system.</p>",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Master user session token</p>"
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /userCount",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"count\": 456788\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/masterController.js",
    "groupTitle": "master"
  },
  {
    "type": "get",
    "url": "/promocodes/:count/:months",
    "title": "generate promocodes",
    "group": "master",
    "name": "generate_promocodes",
    "description": "<p>generate unique promocodes for schools or individuals.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "Number",
            "optional": false,
            "field": "How",
            "description": "<p>manny codes do you wanna generate?. must be between 1 and 2000</p>"
          },
          {
            "group": "Parameters",
            "type": "Number",
            "optional": false,
            "field": "months",
            "description": "<p>integer between 1 and 6 representing the duration of the promocodes</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "school",
            "description": "<p>in case codes are for a teacher/org you gotta send the org/teacher name. this school must already exist on the system!</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /promocodes/3/4?school=whatever",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Master user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"msg\": \"promocodes will be sent to you by email\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/masterController.js",
    "groupTitle": "master"
  },
  {
    "type": "get",
    "url": "/loginRegistry",
    "title": "last logins",
    "group": "master",
    "name": "last_logins",
    "description": "<p>returns info from the newest 60 logins in the last 8 hours.</p>",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Master user session token</p>"
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /loginRegistry",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"msg\": [\n                    {\n                        \"_id\": \"5a23779fcd379524061691a3\",\n                        \"userId\": \"5a235d02e9f5325496eebcfa\",\n                        \"userEmail\": \"pablonicolasm.pm@gmail.com\",\n                        \"date\": \"2017-12-03T04:03:43.638Z\",\n                        \"__v\": 0\n                    }\n                ]\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/masterController.js",
    "groupTitle": "master"
  },
  {
    "type": "post",
    "url": "/rankCard",
    "title": "rank card",
    "group": "practice",
    "name": "rank_card",
    "description": "<p>send name of the card, it'll rank your answer and update the metadata for sp practice, gives u points too.</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "string",
            "optional": false,
            "field": "cardId",
            "description": "<p>id for card you wanna rank</p>"
          },
          {
            "group": "Body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>name of the card (the user guessed this value)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /rankCard\n Body: {\n         cardId: ed5e4de5d5rf4r5fr8frfrfr4f540fr,\n         name: train     \n }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":\"true\",\n \"rank\": \"5\" ,\n  \"hit\": \"10\"\n  \"points\": \"450\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/practiceController.js",
    "groupTitle": "practice"
  },
  {
    "type": "get",
    "url": "/spCards",
    "title": "spaced repetition cards",
    "group": "practice",
    "name": "spaced_repetition_cards",
    "description": "<p>gets 8 cards that need sp practice for every card, it hides the card name!.</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "deckId",
            "description": "<p>id for specific deck you wanna practice</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /spCards?deckId=de4f5f2e50ffs4f5f5gg",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":\"true\",\n  \"cards\": \"[{\"_id\":\"ASY54RFRF5TOJB1XW\",\n             \"name\":\"my awesome new card\"\n             \"description\": \"hello world\",\n             \"deckId\": {\"_id\":\"ed5er5edf4frfr5f4rff\", \"lang\":\"en\"}\n             \"imgs\": [{\"hash\":\"4f64b9842a75a917fb4581ab92850adc\",\n                        \"width\": \"245\",\n                        \"height\":\"324\",\n                        \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc\"\n                         },\n                         {\"hash\":\"4f64b9842a75a917fb4581ab92850ade\",\n                          \"width\": \"234\",\n                           \"height\": \"235\",\n                            \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade\"\n                         }]},\n         {\"_id\":\"ASY54RFRFsasd5TOJB1XW\",\n              \"name\": \"cool stuff\"\n             \"description\": \"hello world2\",\n             \"deckId\": {\"_id\":\"ed5er5edf4frfr5f4rff\", \"lang\":\"en\"},\n             \"imgs\": [{\"hash\":\"4f64b9842a75a917fb4581ab92850adc\",\n                        \"width\": \"245\",\n                        \"height\":\"324\",\n                        \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850adc\"\n                         },\n                         {\"hash\":\"4f64b9842a75a917fb4581ab92850ade\",\n                          \"width\": \"234\",\n                           \"height\": \"235\",\n                            \"src\": \"https://d2pkpj1gudc0wt.cloudfront.net/image%2F4f64b9842a75a917fb4581ab92850ade\"\n                         }]}]\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/practiceController.js",
    "groupTitle": "practice"
  },
  {
    "type": "get",
    "url": "/searchGif/:q",
    "title": "searchGif",
    "group": "search",
    "name": "searchGif",
    "description": "<p>receives search parameters and returns array with gif images.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "q",
            "description": "<p>search parameter.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "curl localhost:3000/searchGif/holis",
          "type": "Parameter"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "version": "1.0.0",
    "filename": "controller/searchController.js",
    "groupTitle": "search"
  },
  {
    "type": "get",
    "url": "/translate",
    "title": "translate",
    "group": "search",
    "name": "translate",
    "description": "<p>A translator.</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": false,
            "field": "text",
            "description": "<p>The text you wanna translate.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "from",
            "defaultValue": "undefined",
            "description": "<p>The iso code for the lang of the text param, if not provided the API will try to autodetect it.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": false,
            "field": "to",
            "description": "<p>The iso code for the language to translate the text.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "curl localhost:3000/translate?text=hello&to=en",
          "type": "Parameter"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"text\": \"hola\",\n \"from\": \"en\",\n \"audioSrc\":\"https://d32suzxs6u0rur.cloudfront.net/audio/TTS?lang=es&q=hola\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "controller/searchController.js",
    "groupTitle": "search"
  },
  {
    "type": "get",
    "url": "/translateUsedLangs",
    "title": "translate used langs",
    "group": "search",
    "name": "translate_used_langs",
    "description": "<p>The last languages(from and to) the user used in the translator.</p>",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "curl localhost:3000/translateUsedLangs",
          "type": "Parameter"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"to\": \"es\",\n \"from\": \"en\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "1.0.0",
    "filename": "controller/searchController.js",
    "groupTitle": "search"
  },
  {
    "type": "post",
    "url": "/promocode",
    "title": "link promocode with user",
    "group": "user",
    "name": "link_promocode_with_user",
    "description": "<p>link promocode with user account, returns next due date for the code, and a new authentication token, since the old one was limited</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Number",
            "optional": false,
            "field": "code",
            "description": "<p>promocode</p>"
          },
          {
            "group": "Body",
            "type": "string",
            "optional": false,
            "field": "g-recaptcha-response",
            "description": "<p>recaptcha token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: post /promocode",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "string",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>user session token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"due\": \"2018-06-03T02:19:35.226Z\",\n \"token\": \"dedrfr5f4rfdrf\"}",
          "type": "json"
        }
      ]
    },
    "version": "1.1.0",
    "filename": "controller/userController.js",
    "groupTitle": "user"
  }
] });
