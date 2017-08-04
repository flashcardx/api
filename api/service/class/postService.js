const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Img = require(appRoot + "/models/imgModel");
const Post = require(appRoot + "/models/postModel");
const classModel = require(appRoot + "/models/classModel");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const imgService = require(appRoot + "/service/imgService");
const AWSService = require(appRoot + "/service/AWSService");
const feedService = require(appRoot + "/service/feedService");
const notificationService = require(appRoot + "/service/notificationService");
const classService = require(appRoot + "/service/class/classService");

function post(classname, userId, text, callback){
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var post = new Post;
        post.text = text;
        post.classId = Class._id;
        post.userId = userId;
        post.save()
        .then(()=>{
            return callback({success:true});
        })
        .catch(err=>{
                logger.error("error when trying to post: " + err);
                return callback({success:false, msg:err});
        });    
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

function comment(classname, postId, userId, text, callback){
     classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var comment = {
            text: text,
            userId: userId      
        };
        Post.update({_id:postId, classId: Class._id}, {'$push': { 'comments': comment}, "$inc":{commentsSize: 1}})
        .exec()
        .then(r=>{
            return callback({success:true});
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to push comment: " + err);
                return callback({success:false, msg:err});
        });    
     
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

function validReaction(reaction){
    if(reaction != "likes" && reaction != "loves" && reaction != "hahas" && reaction != "wows" && reaction != "sads" && reaction != "angrys")
        return false;
    return true;
}

function getReactionRestriction(reaction, key){
    switch (reaction) {
        case "likes":
            return {"likes.usersId": key};
        case "loves":
            return {"loves.usersId": key};
        case "hahas":
            return {"hahas.usersId": key};
        case "wows":
            return {"wows.usersId": key};
        case "sads":
            return {"sads.usersId": key};
        case "angrys":
            return {"angrys.usersId": key};    
        default:
            throw "invalid reaction";
    }
}

function getReactionCommentRestriction(reaction, key){
    switch (reaction) {
        case "likes":
            return {"comments.likes.usersId": key};
        case "loves":
            return {"comments.loves.usersId": key};
        case "hahas":
            return {"comments.hahas.usersId": key};
        case "wows":
            return {"comments.wows.usersId": key};
        case "sads":
            return {"comments.sads.usersId": key};
        case "angrys":
            return {"comments.angrys.usersId": key};    
        default:
            throw "invalid reaction";
    }
}

// reaction should be : likes, loves,hahas, wows, sads or angrys
function postReaction(classname, postId, userId, reaction, callback){
    if(validReaction(reaction) == false)
        return callback({success:false, msg:"Invalid reaction"});
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var update = {};
        update[reaction] = update;
        var restrictions =  [ {"_id": {$eq:postId}},
                              {"classId": {$eq:Class._id} }
                            ];        
        var obj = getReactionRestriction(reaction, userId);
        restrictions.push(obj);
        Post.findOne({$and: restrictions}, reaction)
        .exec()
        .then(post=>{
            logger.error("post: " +JSON.stringify(post));
            var count = {};
            var user = {};
            user[reaction+".usersId"] =  userId;
            if(!post){
                    count[reaction + ".count"] = 1;
                    mongoose.set('debug', true);
                    Post.update({_id:postId, classId: Class._id}, {'$push': user, "$inc": count })
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });
            }
            else{
                count[reaction + ".count"] = -1;
                Post.update({_id:postId, classId: Class._id}, {'$pull': user, "$inc": count})
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });    
            }
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to add reaction: " + err);
                return callback({success:false, msg:err});
        });    
     
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}


// reaction should be: likes, loves,hahas, wows, sads or angrys
function commentReaction(classname, postId, commentId, userId, reaction, callback){
    if(validReaction(reaction) == false)
        return callback({success:false, msg:"Invalid reaction"});
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var update = {};
        update[reaction] = update;
        var restrictions =  [ {"_id": {$eq:postId}},
                              {"comments._id": {$eq:commentId}},
                              {"classId": {$eq:Class._id} }
                            ];        
        var obj = getReactionCommentRestriction(reaction, userId);
        restrictions.push(obj);
        Post.findOne({$and: restrictions}, reaction)
        .exec()
        .then(post=>{
            logger.error("post: " +JSON.stringify(post));
            var field = "comments.$."+reaction;
            var count = {};
            var user = {};
            user[field+".usersId"] =  userId;
            if(!post){
                count[field + ".count"] = 1;
                    Post.update({_id:postId, classId: Class._id, "comments._id":commentId}, {'$push': user, "$inc": count })
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    }); 
            }
            else{
                count[field + ".count"] = -1;
                 Post.update({_id:postId, classId: Class._id, "comments._id":commentId}, {'$pull': user, "$inc": count })
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });    
            }
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to add reaction: " + err);
                return callback({success:false, msg:err});
        });    
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

function getPosts(classname, userId, lastId, callback){
       classService.findClassLean(classname, userId, "")
        .then(Class=>{
                if(!Class){
                    logger.error("class not found");
                    return callback({success:false, msg:"Class not found(user must be in the class)"});
                }
                var match = {
                    classId: {$eq: Class._id}
                };
                if(lastId)
                    match._id = {$lt: lastId}
                logger.error("lastid:" + lastId);
                         Post.find(match,
                                 "userId text updated_at likes.count loves.count hahas.count hahas.count "+
                                 "wows.count sads.count angrys.count comments.text comments.userId comments.date "+
                                 "comments.likes.count comments.loves.count comments.hahas.count comments.likes.count "+
                                 "comments.wows.count comments.sads.count comments.angrys.count commentsSize comments._id")
                        .sort({_id: "desc"})
                        .limit(8)
                        .slice("comments", -2)
                        .populate("userId comments.userId", "name thumbnail")
                        .exec()
                    .then(r=>{
                            return callback({success:true, msg:r});
                    })
                    .catch(err=>{
                    logger.error("error when trying to get posts: " + err);
                    return callback({success:false, msg:err});
                    });
        })
        .catch(err=>{
            logger.error("error when trying to get posts, error when finding class: " + err);
            return callback({success:false, msg:err});
        });

}


function getComments(classname, userId, postId, skip, limit, callback){
           classService.findClassLean(classname, userId, "")
        .then(Class=>{
                if(!Class){
                    logger.error("class not found");
                    return callback({success:false, msg:"Class not found(user must be in the class)"});
                }
                var match = {
                    _id: {$eq: postId},
                    classId: {$eq: Class._id}
                }
                    Post.find(match,
                                "comments.text comments.userId comments.date"+
                                "comments.likes.count comments.loves.count comments.hahas.count comments.likes.count "+
                                "comments.wows.count comments.sads.count comments.angrys.count")
                    .where("comments")
                    .slice([parseInt(skip), parseInt(limit)])
                    .populate("comments.userId", "name thumbnail")
                    .exec()
                    .then(r=>{
                            return callback({success:true, msg:r});
                    })
                    .catch(err=>{
                    logger.error("error when trying to get posts: " + err);
                    return callback({success:false, msg:err});
                    });
        })
        .catch(err=>{
            logger.error("error when trying to get posts, error when finding class: " + err);
            return callback({success:false, msg:err});
        });
}



module.exports = {
    post: post,
    comment: comment,
    postReaction: postReaction,
    commentReaction: commentReaction,
    getPosts: getPosts,
    getComments: getComments
}