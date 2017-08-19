define({ "api": [
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
