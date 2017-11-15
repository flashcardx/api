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
        var imgs = parseImgs(response.getBody().value);
        cacheService.putBingResults(q, imgs);
        return callback({success:true, msg:imgs});
    })
    .catch(err=>{
        logger.error('Encountered error making request:' + err);
        return callback({success:false, msg:err});
    });
}

function searchGif(q, callback){
    var url = config.gifApiUrl + "?key=" + config.gifApiKey +"&q=" + q + "&safesearch=moderate&limit=40";
    cacheService.getGifResults(q)
    .then(r=>{
        if(r){
                callback({success:true, msg:r});
                return Promise.resolve(null);
            }
        else return Promise.resolve(1);
    })
    .then(r=>{
        if(!r)
            return Promise.resolve();
        return requestify.get(url);
    })
    .then(r=>{
        if(!r)
            return;
        var imgs = parseGifs(r.getBody().results);
        cacheService.putGifResults(q, imgs);
        return callback({success:true, msg:imgs});
    })
    .catch(err=>{
        logger.error('Encountered error making request:' + err);
        return callback({success:false, msg:err});
    });
}

function parseImgs(data){
    var r = [];
    data.forEach(img=>{
        r.push({
                preview: img.thumbnailUrl,
                real: {
                    src: img.contentUrl,
                    height: img.height,
                    width: img.width
                    }
                });
    });
    return r;
}

function parseGifs(data){
    var r = [];
    data.forEach(img=>{
        r.push({
                preview: img.media[0].tinygif.url,
                real: {
                    src: img.media[0].mediumgif.url,
                    height: img.media[0].mediumgif.dims[1],
                    width: img.media[0].mediumgif.dims[0]
                    }
            });
    });
    return r;
}

module.exports = {
        searchBing: searchBing,
        searchGif: searchGif
}