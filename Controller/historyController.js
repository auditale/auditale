const Favourite = require('../Models/favouriteModel');
const History = require('../Models/historyModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

async function handleGetHistory(req, res) {
    try {
        const userId = req.user.userData._id;
        
        const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });
        const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);
        
        const latestHistoryData = await History.aggregate([
            {   $match: {   "userId": new ObjectId(userId)  }   }, 
            {   $sort: {    createdAt: -1   }   },
            {
                // Group by storyId to make them unique
                $group: {
                _id: "$storyId",
                doc: { $first: "$$ROOT" } // keep the most recent document per storyId
                }
            },
            {
                // Replace root to restore normal structure
                $replaceRoot: { newRoot: "$doc" }
            },
            {
                // Re-sort again by createdAt to restore the original order
                $sort: { createdAt: -1 }
            },
            {   $limit: 100 },
            {
                $addFields: {
                isFav: {
                    $cond: [
                    { $in: ["$storyId", finalUserFavouriteStory ]},
                    1,
                    0
                    ]
                }
                }
            },
            // join with history - story
            {   $lookup:{
                    from: "stories",
                    localField: "storyId",
                    foreignField: "_id",
                    as: "storydata"
                }
            }, {   $unwind: {
                    path: "$storydata",
                    preserveNullAndEmptyArrays: true
                }
            }, {   $project: {
                    _id: 1,
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
                    storyLanguage: "$storydata.storyLanguage",
                    isFav: 1

                }
            }
        ])

        if(latestHistoryData.length == 0) return res.status(400).json({ error: "Records are not found, please play some stories first." });    
        return res.status(200).json(latestHistoryData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleAddHistory(req, res) {
    try {
        const userId = req.user.userData._id;
        const { storyId } = req.body;
        
        const historyData = await History.create({ storyId, userId });
        
        // const historyData = await History.findOneAndUpdate(
        //     { userId, storyId }, // find history by user id and story id
        //     { userId, storyId }, // update or insert the history data
        //     {
        //         upsert: true,
        //         new: true, // return the updated doc
        //         setDefaultsOnInsert: true
        //     }
        // );

        if(!historyData) return res.status(400).json({ error: "History data is not generated. Please try again later" });
        return res.status(201).json({ message:"History data added successfully." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetRecentlyAccessedStories(req, res) {
    try {
        const userId = req.user.userData._id;
        const getRecentlyAccessed = await History.aggregate([
            {   $match: {   "userId": new ObjectId(userId)  }   }, 
            {   $sort: {    createdAt: -1   }   },
            {   $limit: 10 },
            // join with history - story
            {   $lookup:{
                    from: "stories",
                    localField: "storyId",
                    foreignField: "_id",
                    as: "storydata"
                }
            }, {   $unwind: {
                    path: "$storydata",
                    preserveNullAndEmptyArrays: true
                }
            }, {   $project: {
                    _id: 1,
                    userId: 1,
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
            }
        ])

        if(getRecentlyAccessed.length == 0) return res.status(400).json({ error: "Record not found, please play some stories first." });    
        return res.status(200).json(getRecentlyAccessed);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleGetHistory,
    handleAddHistory,
    handleGetRecentlyAccessedStories
}