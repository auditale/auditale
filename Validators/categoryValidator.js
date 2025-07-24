const { body, validationResult } = require('express-validator');
const Category = require('../Models/categoryModel');

const validateCategory = [
    // Validation rules

    body('categoryName')
        .notEmpty().withMessage('Category Name is required').bail()
        .custom(async (value) => {
            const category = await Category.findOne({ categoryName: value });
            if (category) {
                throw new Error('Category name already in use, please add a new category name');
            }
        }),

    // Middleware to handle validation result
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const errorMessage = errors.errors[0].msg;
            return res.status(400).json({ error: errorMessage });
        }
        next();
    }
];

module.exports = {
    validateCategory
}