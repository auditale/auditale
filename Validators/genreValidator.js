const { body, validationResult } = require('express-validator');
const Genre = require('../Models/genreModel');

const validateGenre = [
    // Validation rules

    body('genreName')
        .notEmpty().withMessage('Genre Name is required').bail()
        .custom(async (value) => {
            const genre = await Genre.findOne({ genreName: value });
            if (genre) {
                throw new Error('Genre name already in use, please add a new genre name');
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
    validateGenre
}