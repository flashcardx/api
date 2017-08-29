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
            "description": "<p>Array with either image url or buffer, max 3 images supported.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /card/c/59991371065a2544f7c90288?classname=unlam1\nbody: { \"name\":\"car\",\n         \"description\": \"a ferrari\"\n     }",
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
            "optional": false,
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
    "type": "get",
    "url": "/duplicateCard/:type/:cardId/:deckId",
    "title": "duplicate card",
    "group": "card",
    "name": "duplicate_card",
    "description": "<p>duplicates card from user to user.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>uu:user to user, uc:user to class, cu: class to user.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "cardId",
            "description": "<p>id of the card to be duplicated.</p>"
          },
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id for the deck where card will be created.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /duplicateCard/uu/59991371065a2544f7c90288/59991371065a2544f7c9028a",
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
          "content": "url: /decks/u",
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
    "type": "post",
    "url": "/deckschildren/:type",
    "title": "Get decks inside deck",
    "group": "deck",
    "name": "Get_decks_inside_deck",
    "description": "<p>Returns all decks(name, id and thumbnail) inside a deck, it uses pagination so once limit reached use skip for getting elements from other pages. Note:For getting the final img url you need to concatenate the thumbnail hash you get with the imgBaseUrl parameter that this endpoint will return.</p>",
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
          "content": "url: /deckschildren/u?parentId=59991371065a2544f7c9028c&skip=14",
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
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"decks\": [{\"name\": \"deck1\", id:\"59991371065a2544f7c90288\", \"thumbnail\":\"18428b0dd352776131a209bd24785b8f\"},\n           {\"name\": \"math\", id:\"59991371065a2544fasd8888\", \"thumbnail\":\"18428b0dd352776131a209bd24785b8f\"}],\n \"imgBaseUrl\": \"https://d32suzxs6u0rur.cloudfront.net\"\n }",
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
    "type": "post",
    "url": "/imageDeckFromBuffer/:type",
    "title": "imageDeckFromBuffer",
    "group": "deck",
    "name": "imageDeckFromBuffer",
    "description": "<p>sets deck thumbnail from the data sent. if deck already has an image this one will be replaced with the new one.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class</p>"
          }
        ],
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id of the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "Buffer",
            "optional": false,
            "field": "img",
            "description": "<p>buffer containing the image.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /imageDeckFromUrl/u \nbody: {\n        \"img\": \"{Buffer object}\",\n        \"deckId\": \"5998f5ea23cbd123cf8becce\"\n   }",
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
    "type": "post",
    "url": "/imageDeckFromUrl/:type",
    "title": "imageDeckFromUrl",
    "group": "deck",
    "name": "imageDeckFromUrl",
    "description": "<p>sets deck thumbnail from the url sent. if deck already has an image this one will be replaced with the new one.</p>",
    "parameter": {
      "fields": {
        "Parameters": [
          {
            "group": "Parameters",
            "type": "string",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class</p>"
          }
        ],
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id of the deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "url",
            "description": "<p>url for the image to download.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /imageDeckFromUrl/u \nbody: {\n        \"url\":\"https://myimage.com/beauty.jpeg\",\n        \"deckId\": \"5998f5ea23cbd123cf8becce\"\n   }",
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
    "type": "post",
    "url": "/deck/:type",
    "title": "new deck",
    "group": "deck",
    "name": "new_deck",
    "description": "<p>creates user or class deck depending on type param, returns id of new deck.</p>",
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
            "description": "<p>description for deck.</p>"
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
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deck/u\nbody: {\n        \"name\":\"people\",\n        \"description\": \"beautiful people\",\n        \"parentId\": \"5998f5ea23cbd123cf8becce\",\n        \"lang\": \"es\"\n   }",
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
          "content": "HTTP/1.1 200 OK\n{\"success\":true,\n \"id\": \"59991371065a2544f7c90288\"\n }",
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
    "url": "/updateDeck/:type/:deckId",
    "title": "update deck",
    "group": "deck",
    "name": "update_deck",
    "description": "<p>update name/description/language of the deck. *Only defined parameters will be updated.</p>",
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
            "description": "<p>description for deck.</p>"
          },
          {
            "group": "Request body",
            "type": "string",
            "optional": true,
            "field": "lang",
            "description": "<p>Language code for the deck.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /updateDeck/u/59991371065a2544f7c90288\nbody:  {\n        \"name\":\"people\",\n        \"description\": \"beautiful people\"\n   }",
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
            "type": "number",
            "optional": true,
            "field": "ip",
            "description": "<p>recaptcha needs it.</p>"
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
          "content": "  {\n     \"email\":\"pablo1234@gmail.com\",\n     \"password\": \"1234\",\n     \"ip\": \"192.231.00.21\",\n     \"g-recaptcha-response\": \"abc124xsed4fr\"\n}",
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
      ]
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
            "type": "number",
            "optional": true,
            "field": "ip",
            "description": "<p>recaptcha needs it.</p>"
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
          "content": "  {\n     \"email\":\"pablo1234@gmail.com\",\n     \"name\": \"pablo marino\",\n     \"password\": \"1234\",\n     \"lang\": \"en\",\n     \"g-recaptcha-response\": \"abc124xsed4fr\",\n      \"ip\": \"0.xxx.xxx.xx\"\n}",
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
  }
] });
