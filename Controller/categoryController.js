const Category = require('../Models/categoryModel');

async function handleAddCategory(req, res) {
    try {
        const { categoryName, categoryDesc} = req.body;
        const categoryData = await Category.create({categoryName, categoryDesc});

        if(!categoryData) return res.status(400).json({ error: "Cateogry is not created. Please try again later" });
        return res.status(201).json({"value":"Category inserted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

module.exports = {
    handleAddCategory
}