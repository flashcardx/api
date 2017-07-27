const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
var credentials = require(appRoot + "/config/json/credentials.json")[env];
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
var stream = require('getstream');
// Optionally supply the app identifier and an object specifying the data center to use
client = stream.connect(credentials.getStream.publicKey,
                        credentials.getStream.secretKey,
                        credentials.getStream.appId,
                        { location: credentials.getStream.location });

function publishCardClassFeed(classname, cardId){
    classFeed = client.feed('class', classname);
    var activity = {
        actor: "Class:"+classname,
        verb: "publish",
        object: cardId,
        type: "card",
        foreign_id: "card" + cardId
    };
    logger.error("publishing activity: " + JSON.stringify(activity));
    classFeed.addActivity(activity);
}


function followClass(classname, userId, lang){
    logger.error("following class: " + classname + ", userid: " + userId, "lang: " + lang);
    userFeed = client.feed('timeline', lang+userId);
    userFeed.follow("class", classname);
}

function unfollowClass(classname, userId, lang){
    userFeed = client.feed('timeline', lang+userId);
    userFeed.unfollow("class", lang+classname);
}

function getFeed(userId, lang, lastId){
    logger.error("get user feed for: " + userId + ", lang: " + lang);
    logger.error("lastid:" + lastId);
    userFeed = client.feed('timeline', lang+userId);
    var restrictions = {limit:10};
    if(lastId)
        restrictions.id_lt = lastId;
    return userFeed.get(restrictions); //returns promise
}

function removeCardFromClass(classname, cardId){
    classFeed = client.feed('class', classname);
    classFeed.removeActivity({foreignId:"card"+cardId});
}

module.exports = {
    publishCardClassFeed: publishCardClassFeed,
    followClass: followClass,
    unfollowClass: unfollowClass,
    getFeed: getFeed,
    removeCardFromClass: removeCardFromClass
};