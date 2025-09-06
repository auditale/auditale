const RecentSearch = require("../Models/recentsearchModel");
const Story = require("../Models/storyModel");

async function handleSearchStory(req, res) {

    const { query } = req.body;
    if(!query) return res.status(400).json({ error: "Please provide the query first." });
    
    const regex = new RegExp(query, 'i');
    const storyResultData = await Story.find({ $or: [{ storyTitle: regex }, { storyDescription: regex }] });

    if(storyResultData.length == 0) return res.status(400).json({ error: "Record not found, please try again with the new keyword." });    
    return res.status(201).json(storyResultData);
}

async function handleAddRemoveRecentSearched(req, res) {
    try {
        const userId = req.data.loggedInUserData._id;
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
        const userId = req.data.loggedInUserData._id;
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