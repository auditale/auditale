const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your Story model
        required: true
    },
    storyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story', // This should match the name of your Story model
        required: true
    },
    starCount:{
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Rating = mongoose.model('Rating', RatingSchema);
module.exports = Rating;