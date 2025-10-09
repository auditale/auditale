const Category = require('../Models/categoryModel');

async function handleAddCategory(req, res) {
    try {
        const { categoryName, categoryDesc} = req.body;
        const categoryData = await Category.create({categoryName, categoryDesc});

        if(!categoryData) return res.status(400).json({ error: "Cateogry is not created. Please try again later" });
        return res.status(201).json({ "message":"Category inserted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

async function handleGetAllCategories(req, res) {
    try {
        const allCategories = await Category.find({}, { categoryName: 1, categoryDesc: 1, _id: 0 });

        if(!allCategories) return res.status(400).json({ error: "Cateogry is not found. Please add a new one." });
        return res.status(200).json(allCategories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}


module.exports = {
    handleAddCategory,
    handleGetAllCategories
}