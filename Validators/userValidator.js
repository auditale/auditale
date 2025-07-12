const { body, validationResult } = require('express-validator');
const User = require('../Models/userModel');

const validateRegisterUser = [
    // Validation rules
    
    body('username')
        .notEmpty().withMessage('Username is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters for the username'),

    body('email')
        .notEmpty().withMessage('Email is required').bail()
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error('Email already in use, please add a new email');
            }
        })
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .notEmpty().withMessage('Password is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters of the password'),

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

const validateLoginUser = [
    // Validation rules
    
    body('email')
        .notEmpty().withMessage('Email is required').bail()
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .notEmpty().withMessage('Password is required').bail()
        .isLength({ min: 5 }).withMessage('Enter at least 5 characters'),

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
    validateLoginUser,
    validateRegisterUser
}