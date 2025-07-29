const Story = require("../Models/storyModel");

async function handleSearchStory(req, res) {

    const { query } = req.body;
    if(!query) return res.status(400).json({ error: "Please provide the query first." });
    
    const regex = new RegExp(query, 'i');
    const storyResultData = await Story.find({ $or: [{ storyTitle: regex }, { storyDescription: regex }] });

    if(storyResultData.length == 0) return res.status(400).json({ error: "Record not found, please try again with the new keyword." });    
    return res.status(201).json({ "value": storyResultData });
}

module.exports = {
    handleSearchStory
}