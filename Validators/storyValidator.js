const { body, validationResult } = require('express-validator');
const Story =  require('../Models/storyModel') 

const validateStory = [
    // Validation rules

    body('storyTitle')
    .notEmpty().withMessage('story title is required').bail()
    .isLength({ min: 5 }).withMessage('Enter at least 5 characters for the story title')
    .custom(async (value) => {
        const story = await Story.findOne({ storyTitle: value });
        if (story) {
            throw new Error('Story title already in use, please add a new story title');
        }
    }),

    body('storyDescription')
        .notEmpty().withMessage('Story description is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters for the story description'),

    body('storyImage')
        .notEmpty().withMessage('Story image is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters for the story image'),

    body('storyURL')
        .notEmpty().withMessage('Story URL is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters for the story URL'),

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
    validateStory
}