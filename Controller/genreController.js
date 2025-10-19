const Genre = require('../Models/genreModel');

async function handleAddGenre(req, res) {
    try {
        const { genreName, genreDesc} = req.body;
        const genreData = await Genre.create({genreName, genreDesc});

        if(!genreData) return res.status(400).json({ error: "Cateogry is not created. Please try again later" });
        return res.status(201).json({ "message":"Genre inserted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllGenres(req, res) {
    try {
        const allGenres = await Genre.find({});

        if(!allGenres) return res.status(400).json({ error: "Cateogry is not found. Please add a new one." });
        return res.status(200).json(allGenres);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}


module.exports = {
    handleAddGenre,
    handleGetAllGenres
}