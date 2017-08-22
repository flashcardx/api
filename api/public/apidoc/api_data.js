define({ "api": [
  {
    "type": "post",
    "url": "/imageDeckFromUrl/:type",
    "title": "imageDeckFromUrl",
    "group": "deck",
    "name": "imageDeckFromUrl",
    "description": "<p>sets deck thumbnail from the url sent. if deck already as an image this one will be replaced with the new one.</p>",
    "parameter": {
      "fields": {
        "type": [
          {
            "group": "type",
            "optional": false,
            "field": "type",
            "description": "<p>u or c depending on if deck belongs to user or class</p>"
          }
        ],
        "deckbody": [
          {
            "group": "deckbody",
            "type": "string",
            "optional": false,
            "field": "deckId",
            "description": "<p>id of the deck.</p>"
          },
          {
            "group": "deckbody",
            "type": "string",
            "optional": false,
            "field": "url",
            "description": "<p>url for the image to download.</p>"
          },
          {
            "group": "deckbody",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>in case the decks belongs to a class.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /imageDeckFromUrl/u \n     {\n        \"url\":\"https://myimage.com/beauty.jpeg\",\n        \"deckId\": \"5998f5ea23cbd123cf8becce\"\n   }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "accessToken": [
          {
            "group": "accessToken",
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
        "deckbody": [
          {
            "group": "deckbody",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>name for the deck.</p>"
          },
          {
            "group": "deckbody",
            "type": "string",
            "optional": false,
            "field": "description",
            "description": "<p>description for deck.</p>"
          },
          {
            "group": "deckbody",
            "type": "string",
            "optional": true,
            "field": "classname",
            "description": "<p>needed if deck will be for a class.</p>"
          },
          {
            "group": "deckbody",
            "type": "string",
            "optional": true,
            "field": "parentid",
            "description": "<p>required if new deck(child) is inside another deck(parent).</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "url: /deck/u\n     {\n        \"name\":\"people\",\n        \"description\": \"beautiful people\",\n        \"parentid\": \"5998f5ea23cbd123cf8becce\"\n   }",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "accessToken": [
          {
            "group": "accessToken",
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
    "url": "/login",
    "title": "login",
    "group": "login",
    "name": "login",
    "description": "<p>receives user email and paswword and returns token with userid encrypted in it. note: the client can see the userid easily since getting the real data in the token is really easy, but setting data in a token is impossible(thanks to secret) ;).</p>",
    "parameter": {
      "fields": {
        "user": [
          {
            "group": "user",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>user email.</p>"
          },
          {
            "group": "user",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>user password.</p>"
          }
        ],
        "client": [
          {
            "group": "client",
            "type": "number",
            "optional": true,
            "field": "ip",
            "description": "<p>recaptcha needs it.</p>"
          }
        ],
        "recaptcha": [
          {
            "group": "recaptcha",
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
        "user": [
          {
            "group": "user",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>can not exist other user with same email.</p>"
          },
          {
            "group": "user",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>user name.</p>"
          },
          {
            "group": "user",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>user password.</p>"
          },
          {
            "group": "user",
            "type": "string",
            "optional": true,
            "field": "lang",
            "defaultValue": "en",
            "description": "<p>language shortcode</p>"
          }
        ],
        "client": [
          {
            "group": "client",
            "type": "number",
            "optional": true,
            "field": "ip",
            "description": "<p>recaptcha needs it.</p>"
          }
        ],
        "recaptcha": [
          {
            "group": "recaptcha",
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
    "url": "/searchGif/:q",
    "title": "searchGif",
    "group": "search",
    "name": "searchGif",
    "description": "<p>receives search parameters and returns array with gif images.</p>",
    "parameter": {
      "fields": {
        "search parameters": [
          {
            "group": "search parameters",
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
          "type": "param"
        }
      ]
    },
    "header": {
      "fields": {
        "accessToken": [
          {
            "group": "accessToken",
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
