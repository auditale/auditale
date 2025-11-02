const Story = require('../Models/storyModel');
const History = require('../Models/historyModel');
const Favourite = require('../Models/favouriteModel');
const Genre = require('../Models/genreModel');
const Rating = require('../Models/ratingModel');
const { ObjectId } = require('mongoose').Types;

async function handleAddStory(req, res) {
    try {
        const { storyTitle, storyDescription, storyImage, storyURL, genreId} = req.body;
        const genreIds = new ObjectId(genreId);
        const StoryData = await Story.create({storyTitle, storyDescription, storyImage, storyURL, genreId: genreIds});

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
                                
        if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this genre." });
        return res.status(200).json(finalAllStoryWithUserFavourite);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllGenreBasedStory(req, res) {
    try {
        const genreName = req.query.genreName;
        const userId = req.user.userData._id;

        const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });

        const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);

        if(genreName != ""){
            const finalAllStoryWithUserFavourite = await Story.aggregate([{
                                        $match: {
                                            storyGenre: genreName
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


            if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this genre." });
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

            if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No stories found associated with this genre." });
            return res.status(200).json(finalAllStoryWithUserFavourite);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllUserFavouriteStory(req, res) {
    try {

        const { sortTitle, filterGenre, sortDate } = req.query;
        
        const userId = req.user.userData._id;
        const sortStage = {};

        if (sortTitle) {
            sortStage.storyTitle = sortTitle === "desc" ? -1 : 1;
        }

        if (sortDate) {
            sortStage.createdAt = sortDate === "desc" ? -1 : 1;
        }

        if (Object.keys(sortStage).length === 0) {
            sortStage.createdAt = -1;
        }

        const finalAllStoryWithUserFavourite = await Favourite.aggregate([
                                    {
                                        $match: {
                                            "userId": new ObjectId(userId)
                                        }
                                    },
                                    // join with favourite - story
                                    {   $lookup:{
                                            from: "stories",
                                            localField: "storyId",
                                            foreignField: "_id",
                                            as: "storydata"
                                        }
                                    },
                                    {   $unwind: {
                                            path: "$storydata",
                                            preserveNullAndEmptyArrays: true
                                        }
                                    },
                                    // Optional filter by genre (if filterGenre exists)
                                    ...(filterGenre
                                        ? [
                                            {
                                            $match: {
                                                "storydata.storyGenre": { $regex: filterGenre, $options: "i" }
                                            }
                                            }
                                        ]
                                        : []),
                                    {   $project: {
                                            userId: 1,
                                            storyId: "$storydata._id",
                                            ageRange: "$storydata.ageRange",
                                            audioURL: "$storydata.audioURL",
                                            imageURL: "$storydata.imageURL",
                                            createdAt: "$storydata.createdAt",
                                            storyTags: "$storydata.storyTags",
                                            storyText: "$storydata.storyText",
                                            storyGenre: "$storydata.storyGenre",
                                            storyMoral: "$storydata.storyMoral",
                                            storyTheme: "$storydata.storyTheme",
                                            storyTitle: "$storydata.storyTitle",
                                            audioLength: "$storydata.audioLength",
                                            storySummary: "$storydata.storySummary",
                                            thumbnailURL: "$storydata.thumbnailURL",
                                            storyLanguage: "$storydata.storyLanguage"
                                        }
                                    },{
                                        $sort: sortStage
                                    }
                                ]);
                                
        if(finalAllStoryWithUserFavourite.length  == 0) return res.status(200).json({ "error":"No favourite stories found." });
        return res.status(200).json(finalAllStoryWithUserFavourite);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllGenreWithStories(req, res) {
    try {
        const allGenres = await Genre.find();
        const finalallGenres = allGenres.map(item => item._id);

        const getThreeStoriesOfEachGenre = await Story.find({ genreId: { $in: finalallGenres } })
        .sort({ createdAt: -1 })  // Sort by 'createdAt' descending (latest first)
        .limit(3);

        // Function to group stories by genreId
        const groupStoriesByGenre = (getThreeStoriesOfEachGenre) => {
        return getThreeStoriesOfEachGenre.reduce((acc, item) => {
            const { genreId } = item;
            if (!acc[genreId]) {
                acc[genreId] = [];
            }
            acc[genreId].push(item);
            return acc;
        }, {});
        };

        // Group stories
        const finalGroupStoriesByGenre = groupStoriesByGenre(getThreeStoriesOfEachGenre);
        return res.status(200).json(finalGroupStoriesByGenre);
        
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
        const currentStoryId = req.query.currentStoryId;
        const storyData = await Story.find({ _id: new ObjectId(currentStoryId) },{ storyGenre: 1, _id: 0 });
        
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
                                                                {storyGenre: storyData[0]['storyGenre']}
                                                                // {storyTags: storyData[0]['storyTags']}
                                                            ],
                                                            _id: { $ne: new ObjectId(currentStoryId) }
                                                        }
                                                    },
                                                    {
                                                        $sort: { createdAt: -1 }
                                                    }
                                                ]);
        
        if(finalStoryData.length  == 0) return res.status(200).json({ "error":"No stories found associated with this genre and tags." });
        return res.status(200).json(finalStoryData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllUserRecommedationsStories(req, res) {
    try {
        const userId = req.user.userData._id;

        // took genre of highest 15 played stories
        const finalHighestPlayedStories = await History.aggregate([{
                                        $match: { userId: new ObjectId(userId) } },
                                    {   $group: { _id: "$storyId", count: { $sum: 1 } } },
                                    {   $sort: { count: -1 } },
                                    {   $limit: 15 },
                                    {   $lookup: {
                                            from: 'stories',
                                            localField: '_id',
                                            foreignField: '_id',
                                            as: 'sortingData',
                                        }
                                    },
                                    {   $project: {
                                            _id: 0,
                                            storyGenre: { $arrayElemAt: ["$sortingData.storyGenre", 0] }
                                        }
                                    }
                                ]);

        // took genre of stories who received greater than or equal 3 stars from the logged in users
        const finalHighestRatingStories = await Rating.aggregate([{   
                                        $match: { 
                                            userId: new ObjectId(userId),
                                            starCount: { $gte: 3 }  
                                        }   
                                    },
                                    {   $sort: {
                                            sortingCount: -1
                                        }
                                    },
                                    {   $lookup: {
                                            from: 'stories',
                                            localField: 'storyId',
                                            foreignField: '_id',
                                            as: 'sortingData',
                                        }
                                    },
                                    {   $project: {
                                            _id: 0,
                                            storyGenre: { $arrayElemAt: ["$sortingData.storyGenre", 0] }
                                        }
                                    }
                                ]);

        const finalFilteredStories = [...finalHighestPlayedStories, ...finalHighestRatingStories];
        const finalUniqueGenre = [...new Set(finalFilteredStories.map(item => item.storyGenre))];

        // Explanation:
        // finalFilteredStories.map(item => item.storyGenre) extracts all storyGenre values into an array.
        // new Set(...) removes duplicates because a Set only keeps unique values.
        // [...new Set(...)] converts the Set back into an array.

        const finalStoryResult = await Story.find({ storyGenre: finalUniqueGenre[0] });
        return res.status(200).json(finalStoryResult);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddStory,
    handleGetAllStory,
    handleGetAllGenreBasedStory,
    handleGetAllGenreWithStories,
    handleGetTrialStories,
    handleGetAllRelatedStories,
    handleGetAllUserRecommedationsStories,
    handleGetAllUserFavouriteStory
}