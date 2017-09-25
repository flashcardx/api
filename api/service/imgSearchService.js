const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const requestify = require('requestify'); 
const cacheService = require("./cacheService");
const shutterstock = require('shutterstock');
const pixabayBaseUrl = `${config.APIPixabayUrl}/?key=${config.APIPixabayKey}`;
const MAX_PER_PAGE = 20;
const MINIMUM = 15;
const shutterstockAPI = shutterstock.v2({
  clientId: '2a32fb3e058e7de16156',
  clientSecret: '0d096f428d635dd82c83ed3b87116370c2825255',
});


function searchBing(q, clientIp, callback){
    if(!clientIp){
        logger.error("client ip undefined, will be replaced with empty string, if this continues Bing may think it is ddos attack");
        clientIp = clientIp;
    }
    cacheService.getBingResults(q)
    .then(r=>{
            if(r){
                callback({success:true, msg:r});
                return Promise.resolve(null);
            }
            return Promise.resolve(1);
    })
    .then(r=>{
        if(!r)
            return Promise.resolve();
        var url = config.BingUrl + "?q=" + q  + "&count=40";
        return requestify.get(url, { 
                    headers:{
                    "Ocp-Apim-Subscription-Key": config.BingKey,
                    "X-Search-ClientIP": clientIp
                }})
    })
    .then(response=>{
        if(!response)
            return; 
        var r = response.getBody();
        cacheService.putBingResults(q, r);
        return callback({success:true, msg:r});
    })
    .catch(err=>{
        logger.error('Encountered error making request:' + err);
        return callback({success:false, msg:err});
    });
}

function searchGif(q, callback){
    logger.error("key: " + config.gifApiKey);
    var url = config.gifApiUrl + "?key=" + config.gifApiKey +"&q=" + q + "&safesearch=moderate&limit=40";
    requestify.get(url)
    .then(r=>{
        var data = r.getBody();
        return callback({success:true, msg:data});
    })
    .catch(err=>{
        logger.error('Encountered error making request:' + err);
        return callback({success:false, msg:err});
    });
}



module.exports = {
        searchBing: searchBing,
        searchGif: searchGif
    }