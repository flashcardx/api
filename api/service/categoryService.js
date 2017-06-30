const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);
const Category = require(appRoot + "/models/categoryModel");
const userService = require("./userService");

function saveCategory(cat, callback){
    var category = new Category(cat);
    category.save(err=>{
                    if(err){
                            logger.error(String(err));
                            return callback({success:false, msg: String(err)});     
                        }
                         return callback({success:true});
                    });
}

function createCategoryIfNew(userId, lang, catName){
    return new Promise((resolve, reject)=>{
            if(!catName)
                return resolve();
            Category.find({ownerId: userId, lang: lang, name: catName}, "names")
            .exec().then(docs=>{
                if(docs.length === 0){
                    var newCat = {
                        ownerId: userId,
                        lang: lang,
                        name: catName
                    }
                    saveCategory(newCat, r=>{
                        if(r.success === false)
                            return reject();
                        else
                            return resolve();
                    });
                }
                else
                    resolve();
            });
    })
}

                    

function deleteCategory(userId, category){
         return new Promise((resolve, reject)=>{
             if(!category)
                return resolve();
             userService.getUserLang(userId, r=>{
                 if(r.success=== false)
                    reject(r);
                 var lang = r.msg;
                Category.find({ownerId: userId, lang: lang, name: category})
                .remove().exec().then(result=>{
                    logger.error("result: " + result);
                    if(result)
                        reject(result);
                    else
                        resolve();
                })
             });
    });
}

function getCategories(userId, callback){
    userService.findById(userId, "lang", r=>{
        if(r.success === false)
            return callback(r);
        var lang = r.msg.lang;
        Category.find({ownerId: userId, lang: lang}, "name -_id")
        .exec().then(docs=>{
            return callback({success: true, msg:docs});
        });
    });
}

module.exports = {
    createCategoryIfNew: createCategoryIfNew,
    deleteCategory: deleteCategory,
    getCategories: getCategories
}