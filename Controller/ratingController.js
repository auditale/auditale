const Rating = require("../Models/ratingModel");

async function handleAddRatings(req, res) {
    try {
        const userId = req.data.loggedInUserData._id;
        const { storyId, starCount } = req.body;
        
        if(starCount <= 5 && starCount >= 1){
            // const ratingData = await Rating.create({ userId, storyId, starCount });

            const ratingData = await Rating.findOneAndUpdate(
                { userId, storyId }, // find profile by user id
                { userId, storyId, starCount }, // update or insert the profile data
                {
                    upsert: true,
                    new: true, // return the updated doc
                    setDefaultsOnInsert: true
                }
            );
            if(!ratingData) return res.status(400).json({ error: "Rating data is not submitted. Please try again later" });
            return res.status(201).json(ratingData);
        }else{
            return res.status(400).json({ error: "Star count should be less than or equal to 5 or greater than or equal to 1" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddRatings
}