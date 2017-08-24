const logging = require("./logging");
const errorHandling = require("./errorHandling");
const security = require("./security");
const compressor = require("./compressor");
const bodyParser = require("body-parser");
module.exports = {
    init: function(app){
                logging(app);
                security(app);
                compressor(app);
                app.use(bodyParser.json({limit: '12mb'}));
                errorHandling(app); // always let it at the end
        },
    utils: require("./utils")  
}