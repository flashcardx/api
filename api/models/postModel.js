const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const validators = require("./validators/postValidators");

const postSchema = new Schema({

    classId: {
        type:Schema.Types.ObjectId,
        required: [true, 'classId is required'],
        index: true
    },
    userId: {
        type:Schema.Types.ObjectId,
        required: [true, 'userId is required'],
        index: true
    },
    text:{
        type: String,
        required: [true, 'text is required'],
        validate: validators.textValidator
    },
    name:{
        type: String
    },
    comments:[{
                userId: {
                        type:Schema.Types.ObjectId,
                        required: [true, 'userId is required']
                        },
                date:{
                    type: Date,
                    default: Date.now
                },
                text:{
                      type: String,
                      required: [true, 'text is required'],
                      validate: validators.commentValidator
                    },
                likes:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                    }],
                dislikes:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                        }],
                laughs:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                        }],
                hoorays:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                        }],
                confused:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                        }],
                hearts:[{
                            userId:Schema.Types.ObjectId,
                            name: String
                        }]    
    }],
    likes:[{
        userId:Schema.Types.ObjectId,
        name: String
    }],
    dislikes:[{
        userId:Schema.Types.ObjectId,
        name: String
    }],
    laughs:[{
        userId:Schema.Types.ObjectId,
        name: String
    }],
    hoorays:[{
        userId:Schema.Types.ObjectId,
        name: String
    }],
    confused:[{
        userId:Schema.Types.ObjectId,
        name: String
    }],
    hearts:[{
        userId:Schema.Types.ObjectId,
        name: String
    }]
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
);

postSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const post = mongoose.model("post", postSchema);
post.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = post;