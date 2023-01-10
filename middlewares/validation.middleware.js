import { body } from 'express-validator';
import { User } from '../models/users.model.js';

export const userValidations = [
    body('name')
        .isAlpha().withMessage('Please enter a valid name'),
    body('username')
        .isAlphanumeric().withMessage('Please enter a valid username')
        .custom(async(value, {req}) => {
            const user = await User.findOne({username:req.body.username})
            if (user) {
               return Promise.reject('This username is already in use')
            }

            return true
        }),

    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .custom(async (value, { req }) => {
            const user = await User.findOne({email: req.body.email});
            if(user){
                return Promise.reject('This Email is already in use')
            }

            return true
        }),

    body('password')
        .isLength({min: 5}).withMessage('Password shouldnt be less than 5 chars')
]