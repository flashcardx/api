const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Img = require(appRoot + "/models/imgModel");
const imgService = require(appRoot + "/service/imgService");

module.exports = function(app){
    const controllerUtils = require(appRoot + "/middleware").utils(app);

    /**
 * @api {post} /imageProxy Image proxy
 * @apiGroup image
 * @apiName Image proxy
 * @apiDescription recives dimentions and url or buffer of the image, saves it and returns hash(if concatenated with CDN url you get the image url) you must either send data or url parameters in the body. but never both.
 * @apiParam (Request body) {string} [data] buffer with image data for saving.
 * @apiParam (Request body) {string} [url] image url for downloading.
 * @apiHeader (Headers) {string} x-access-token user session token
 * @apiParamExample {json} Request-Example:
 * url: /imageProxy
 * body: {
 *         "url":"www.example.com/img.jpg"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "hash": "599dae000df00e4588f5ea23cbd123cf8becce"
 *      }
 * @apiVersion 1.1.0
 *  */
    app.post("/imageProxy", controllerUtils.requireLogin, (req, res)=>{
        const img = req.body;
        logger.error("img: ", img);
        if(img.url)
            return imgService.proxyFromUrl(img.url, r=>{
                res.json(r);
            });
        else if(img.data)
            return imgService.proxyFromBuffer(img.data, r=>{
                res.json(r);
            });
        else res.json({success:false, msg:"Img must have either url or data"});
    });

}