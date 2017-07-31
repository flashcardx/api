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

function publishCardClassFeed(classId, cardId){
    classFeed = client.feed('class', classId);
    var activity = {
        actor: "Class:"+classId,
        verb: "publish",
        object: cardId,
        type: "card",
        foreign_id: "card" + cardId
    };
    classFeed.addActivity(activity);
}


function followClass(classId, userId, lang){
    userFeed = client.feed('timeline', lang+userId);
    userFeed.follow("class", classId);
}

function unfollowClass(classId, userId, lang){
    userFeed = client.feed('timeline', lang+userId);
    userFeed.unfollow("class", lang+classId);
}

function getFeed(userId, lang, lastId){
    userFeed = client.feed('timeline', lang+userId);
    var restrictions = {limit:10};
    if(lastId)
        restrictions.id_lt = lastId;
    return userFeed.get(restrictions); //returns promise
}

function removeCardFromClass(classId, cardId){
    classFeed = client.feed('class', classId);
    classFeed.removeActivity({foreignId:"card"+cardId});
}

module.exports = {
    publishCardClassFeed: publishCardClassFeed,
    followClass: followClass,
    unfollowClass: unfollowClass,
    getFeed: getFeed,
    removeCardFromClass: removeCardFromClass
};