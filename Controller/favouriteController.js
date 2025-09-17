const Favourite = require('../Models/favouriteModel');
const { ObjectId } = require('mongoose').Types;

async function handleAddRemoveFavourite(req, res) {
    try {
        const userId = req.data.loggedInUserData._id;
        const { storyIds } = req.body;

        if(!storyIds) return res.status(400).json({ error: "Please provide the story id first." });

        const storyId = new ObjectId(storyIds);

        const favouriteExistData = await Favourite.findOne({ userId, storyId });
        if(favouriteExistData) {
            const deleteFavouriteData = await Favourite.deleteOne({ storyId: storyId, userId: userId });
            return res.status(201).json({ "message":"Story removed from the favourite successfully." });
        }else {
            const createFavouriteData = await Favourite.create({userId, storyId});
            return res.status(201).json({ "message":"Story added to favourite successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddRemoveFavourite,
}