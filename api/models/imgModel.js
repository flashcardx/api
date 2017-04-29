const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imgSchema = new Schema({

    hash: { type:String,
            required: [true, 'hash is required'],
            unique: [true, 'img hash already in use, has to be unique'], 
    },
    timesUsed:{
        type:Number,
        default: 1
    }
});

const img = mongoose.model('img', imgSchema);

module.exports = img;