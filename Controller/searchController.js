const RecentSearch = require("../Models/recentsearchModel");
const Story = require("../Models/storyModel");
const Favourite = require('../Models/favouriteModel');

async function handleSearchStory(req, res) {

    const { searchTerm, sortTitle, filterGenre, sortDate } = req.query;
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
    
    const userFavouriteStory = await Favourite.find({ userId: userId }, { storyId: 1, _id: 0 });
    const finalUserFavouriteStory = userFavouriteStory.map(item => item.storyId);
    
    if(!searchTerm) return res.status(400).json({ error: "Please search something..." });
    
    const regex = new RegExp(searchTerm, 'i');
    // const storyResultData = await Story.find({ $or: [{ storyTitle: regex }, { storySummary: regex }] });
    const latestData = await Story.aggregate([
                                            {
                                                $match: {
                                                    $or: [
                                                        { storyTitle: regex },
                                                        { storySummary: regex }
                                                    ]
                                                }
                                            },
                                            // Adding the isFav field to the documents
                                            {
                                                $addFields: {
                                                    isFav: {
                                                        $cond: [
                                                            { $in: ["$_id", finalUserFavouriteStory] },
                                                            1,
                                                            0
                                                        ]
                                                    }
                                                }
                                            },
                                            // Optional filter by genre (if filterGenre exists)
                                            ...(filterGenre
                                                ? [
                                                    {
                                                    $match: {
                                                        "storyGenre": { $regex: filterGenre, $options: "i" }
                                                    }
                                                    }
                                                ]
                                                : []),
                                            // Projecting only necessary fields
                                            {
                                                $project: {
                                                    _id: 1,
                                                    ageRange: 1,
                                                    audioURL: 1,
                                                    imageURL: 1,
                                                    createdAt: 1,
                                                    storyTags: 1,
                                                    storyText: 1,
                                                    storyGenre: 1,
                                                    storyMoral: 1,
                                                    storyTheme: 1,
                                                    storyTitle: 1,
                                                    audioLength: 1,
                                                    storySummary: 1,
                                                    thumbnailURL: 1,
                                                    storyLanguage: 1,
                                                    isFav: 1
                                                }
                                            },{
                                                $sort: sortStage
                                            }
                                        ]);

    if(latestData.length == 0) return res.status(400).json({ error: "Record not found, please try again with the new keyword." });    
    return res.status(201).json(latestData);
}

async function handleAddRemoveRecentSearched(req, res) {
    try {
        const userId = req.user.userData._id;
        const { searchTerm } = req.body;
        const userSearches = await RecentSearch.find({ userId });
        if(userSearches.length >= 5){
            const oldestRecord = userSearches[0];
            await RecentSearch.findByIdAndDelete(oldestRecord._id);
        }

        await RecentSearch.create({ userId: userId, searchTerm: searchTerm});
        const updatedUserSearches = await RecentSearch.find({ userId }).sort({ createdAt: 1 });

        return res.status(200).json({ updatedUserSearches });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllRecentSearched(req, res) {
    try {
        const userId = req.user.userData._id;
        const userSearches = await RecentSearch.find({ userId });
        if(userSearches.length < 0){
            return res.status(200).json({ userSearches });
        }else{
            return res.status(200).json({ "message": "There are no search results found please enter any keyword."});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleSearchStory,
    handleAddRemoveRecentSearched,
    handleGetAllRecentSearched
}