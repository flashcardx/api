const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

module.exports = function(app){

    app.get("/langs", (req, res)=>{
        res.json(config.lang);
    });

}