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

function publishDeckClassFeed(deckId, classId, classname, userId, username){
    classFeed = client.feed('class', classId);
    var activity = {
        actor: "Class:"+classId,
        verb: "publish",
        userId: userId,
        username: username, 
        classname: classname,
        classId: classId,
        object: deckId,
        type: "deck1",
        foreign_id: "deck" + deckId
    };
    classFeed.addActivity(activity);
}

function publishPost(postId, classId, classname, userId, username){
    classFeed = client.feed('class', classId);
    var activity = {
        actor: "Class:"+classId,
        verb: "publish",
        classname: classname,
        classId: classId,
        username: username,
        userId: userId,
        object: postId,
        type: "post",
        foreign_id: "post" + postId
    };
    classFeed.addActivity(activity);
}

function followClass(classId, userId){
    userFeed = client.feed('timeline', userId);
    userFeed.follow("class", classId);
}

function unfollowClass(classId, userId){
    userFeed = client.feed('timeline', userId);
    userFeed.unfollow("class", classId);
}

function getFeed(userId, lastId){
    userFeed = client.feed('timeline', userId);
    var restrictions = {limit:12};
    if(lastId)
        restrictions.id_lt = lastId;
    return userFeed.get(restrictions); //returns promise
}

function removeDeckFromClass(classId, deckId){
    classFeed = client.feed('class', classId);
    classFeed.removeActivity({foreignId:"deck"+deckId});
}

module.exports = {
    publishDeckClassFeed: publishDeckClassFeed,
    followClass: followClass,
    unfollowClass: unfollowClass,
    getFeed: getFeed,
    removeDeckFromClass: removeDeckFromClass,
    publishPost: publishPost
};