const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    storyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story', // This should match the name of your Story model
        required: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your User model
        required: true
    }
}, { timestamps: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);
module.exports = Favourite;