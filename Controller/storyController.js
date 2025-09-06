const Story = require('../Models/storyModel');
const Favourite = require('../Models/favouriteModel');
const { ObjectId } = require('mongoose').Types;

async function handleAddStory(req, res) {
    try {
        const { storyTitle, storyDescription, storyImage, storyURL, categoryId} = req.body;
        const categoryIds = new ObjectId(categoryId);
        const StoryData = await Story.create({storyTitle, storyDescription, storyImage, storyURL, categoryId: categoryIds});

        if(!StoryData) return res.status(400).json({ error: "Story is not created. Please try again later" });
        return res.status(201).json({ "message":"Story inserted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllStory(req, res) {
    const userId = req.data.loggedInUserData._id;
    
    const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });
    const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);
    
    const finalAllStoryWithUserFavourite = await Story.aggregate([
                                {
                                    $addFields: {
                                    isFav: {
                                        $cond: [
                                        { $in: ["$_id", finalUserFavouriteStory ]},
                                        1,
                                        0
                                        ]
                                    }
                                    }
                                }
                            ]);
                            
    if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this category." });
    return res.status(200).json(finalAllStoryWithUserFavourite);
}

async function handleGetAllCategoryBasedStory(req, res) {
    const { categoryId } = req.body;
    const userId = req.data.loggedInUserData._id;

    const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });
    const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);

    if(categoryId != ""){
        const finalCategoryId = new ObjectId(categoryId);
        const finalAllStoryWithUserFavourite = await Story.aggregate([{
                                    $match: {
                                        categoryId: finalCategoryId
                                    }
                                },
                                {
                                $addFields: {
                                    isFav: {
                                        $cond: [
                                        { $in: ["$_id", finalUserFavouriteStory ]},
                                        1,
                                        0
                                        ]
                                    }
                                    }
                                }
                            ]);


        if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this category." });
        return res.status(200).json(finalAllStoryWithUserFavourite);
    }else{
        const finalAllStoryWithUserFavourite = await Story.aggregate([
                                {
                                    $addFields: {
                                    isFav: {
                                        $cond: [
                                        { $in: ["$_id", finalUserFavouriteStory ]},
                                        1,
                                        0
                                        ]
                                    }
                                    }
                                }
                            ]);

        if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this category." });
        return res.status(200).json(finalAllStoryWithUserFavourite);
    }
}

module.exports = {
    handleAddStory,
    handleGetAllStory,
    handleGetAllCategoryBasedStory
}