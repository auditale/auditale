const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    storyTitle:{
        type: String,
        required: true,
        unique: true
    },
    storyDescription:{
        type: String,
        required: true,
    },
    storyImage:{
        type: String,
        required: true,
    },
    storyURL:{
        type: String,
        required: true,
    },
    tags:{
        type: String,
        required: true,
    },
    genreId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre', // This should match the name of your Genre model
        required: true
    }
}, { timestamps: true });

const Story = mongoose.model('Story', storySchema);
module.exports = Story;