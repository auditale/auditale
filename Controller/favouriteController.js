const Favourite = require('../Models/favouriteModel');
const { ObjectId } = require('mongoose').Types;

async function handleAddFavourite(req, res) {
    try {
        const userId = req.data.loggedInUserData._id;
        const { storyIds } = req.body;

        if(!storyIds) return res.status(400).json({ error: "Please provide the story id first." })

        const storyId = new ObjectId(storyIds);

        const favouriteExistData = await Favourite.findOne({ userId, storyId });
        if(favouriteExistData) return res.status(400).json({ error: "The story is already liked by the loggedin user." }) 
        
        const favouriteData = await Favourite.create({userId, storyId});
        if(!favouriteData) return res.status(400).json({ error: "Favourite is not added. Please try again later" })
        
        return res.status(201).json({"value":"Story added to favourite successfully"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleRemoveFavourite(req, res) {
    try {
        const userId = req.data.loggedInUserData._id;
        const { storyIds } = req.body;
        
        if(!storyIds) return res.status(400).json({ error: "Please provide the story id first." })

        const storyId = new ObjectId(storyIds);

        const favouriteExistData = await Favourite.deleteOne({ storyId: storyId, userId: userId });
        if(!favouriteExistData) return res.status(400).json({ error: "Record not found, please try again later." })
        
        
        return res.status(201).json({ "value":"Story removed from the favourite successfully." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddFavourite,
    handleRemoveFavourite
}