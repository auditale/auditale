const Story = require('../Models/storyModel');

async function handleAddStory(req, res) {
    try {
        const { storyTitle, storyDescription, storyImage, storyURL} = req.body;
        const StoryData = await Story.create({storyTitle, storyDescription, storyImage, storyURL});

        if(!StoryData) return res.status(400).json({ error: "Story is not created. Please try again later" })
        return res.status(201).json({"value":"Story inserted successfully"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddStory
}