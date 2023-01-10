import express from 'express';
import { contactUs, signup, signin, updateUser, sendEmail, verification } from '../controllers/users.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import {userValidations} from '../middlewares/validation.middleware.js'

const router = express.Router();

/** sign up */
router.route('/auth/signup')    //http://localhost:5000/api/auth/signup POST body {name: ,username: , email:, password:}
    .post(userValidations, signup);

/** sign in */
router.route('/auth/signin').post(signin);

/** update */
router.route('/user/:uid')
    .patch(protectRoute, updateUser);


/** send email */
router.route('/email')
    .post(sendEmail);


/** verify account */
router.route('/verify/:userid/:verifytoken')
    .get(verification);

/** contact us */
router.route('contactus', contactUs)



export default router;