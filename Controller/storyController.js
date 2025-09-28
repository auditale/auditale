const Story = require('../Models/storyModel');
const Favourite = require('../Models/favouriteModel');
const Category = require('../Models/categoryModel');
const Rating = require('../Models/ratingModel');
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
    try {
        const userId = req.user.userData._id;
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllCategoryBasedStory(req, res) {
    try {
        const { categoryId } = req.body;
        const userId = req.user.userData._id;

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
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllGenreWithStories(req, res) {
    try {
        const allCategories = await Category.find();
        const finalallCategories = allCategories.map(item => item._id);

        const getThreeStoriesOfEachCategory = await Story.find({ categoryId: { $in: finalallCategories } })
        .sort({ createdAt: -1 })  // Sort by 'createdAt' descending (latest first)
        .limit(3);

        // Function to group stories by categoryId
        const groupStoriesByCategory = (getThreeStoriesOfEachCategory) => {
        return getThreeStoriesOfEachCategory.reduce((acc, item) => {
            const { categoryId } = item;
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(item);
            return acc;
        }, {});
        };

        // Group stories
        const finalGroupStoriesByCategory = groupStoriesByCategory(getThreeStoriesOfEachCategory);
        return res.status(200).json(finalGroupStoriesByCategory);
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetTrialStories(req, res) {
    try {
        const trailStoriesData = await Rating.aggregate([
                                    {
                                        $group: {
                                            _id: '$storyId', // Group by storyId
                                            totalStarCount: { $sum: '$starCount' }, // Sum starCount for each story
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'stories',
                                            localField: '_id',
                                            foreignField: '_id',
                                            as: 'storydata',
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            totalStarCount: 1,
                                            storydata: { $arrayElemAt: ['$storydata', 0] }, // Get the first storyDetails object (no repetition)
                                        }
                                    },
                                    {
                                        $sort: { totalStarCount: -1 }, // Sort by totalStarCount in descending order
                                    },
                                    { $limit: 100 }
                                ]);

        if(trailStoriesData.length == 0) return res.status(200).json({ "error":"No stories found." });
        return res.status(200).json(trailStoriesData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }   
}

async function handleGetAllRelatedStories(req, res) {
    try {
        const userId = req.user.userData._id;
        const { currentStoryId } = req.body;
        const storyData = await Story.find({ _id: currentStoryId }, { _id: 0, categoryId: 1, tags: 1 });

        const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });
        const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);

        const finalStoryData = await Story.aggregate([
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
                                                    },
                                                    {
                                                        $match: {
                                                            $or: [
                                                                {categoryId: storyData[0]['categoryId']}, 
                                                                {tags: storyData[0]['tags']}
                                                            ],
                                                            _id: { $ne: new ObjectId(currentStoryId) }
                                                        }
                                                    },
                                                    {
                                                        $sort: { createdAt: -1 }
                                                    }
                                                ]);
        
        if(finalStoryData.length  == 0) return res.status(200).json({ "error":"No stories found associated with this category and tags." });
        return res.status(200).json(finalStoryData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllUserRecommedationsStories(req, res) {
    try {
        console.log("handleGetAllUserRecommedationsStories")
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddStory,
    handleGetAllStory,
    handleGetAllCategoryBasedStory,
    handleGetAllGenreWithStories,
    handleGetTrialStories,
    handleGetAllRelatedStories,
    handleGetAllUserRecommedationsStories
}