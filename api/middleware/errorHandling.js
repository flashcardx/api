const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename); 

module.exports = function(app){

    app.use(function (err, req, res, next) {
        logger.error(err);
        res.status(500).send('Something broke in the server!');
    });

}