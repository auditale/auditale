const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your Story model
        required: true
    },
    storyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story', // This should match the name of your Story model
        required: true
    }
}, { timestamps: true });

const History = mongoose.model('History', HistorySchema);
module.exports = History;