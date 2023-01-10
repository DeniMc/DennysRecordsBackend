import createError from 'http-errors';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { User } from '../models/users.model.js';
import nodemailer from "nodemailer";
import sendgridTransport from "nodemailer-sendgrid-transport";


export const protectRoute = async (req, res, next) => {
    try {
      let token;
      //check the authorization header for token
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(' ')[1];
        }

        //check the cookie for token
      if (req.cookies.access_token) {
        token = req.cookies.access_token;
        }
      
        if(!token){
            return next(createError(
                401, 'You are not logged in yet. Please login to get access.'));
        }


        //1. verify the token here
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


        //2. if user deleted after generating the token
        const selectedUser = await User.findById(decoded.userid);
        if (!selectedUser) {
            return next(createError(401, 'This user already deleted! The token is not valid anymore'))
        }

        //3. if user changed the password after generating the token
        if (selectedUser.changedPass(decoded.iat)) {
          return next(
            createError(
              401,
              "The password of this user is changed recently. Please login again!"
            )
          );
        }

        //grant access to protected route
        req.user = selectedUser;
        next()
    } catch (error) {
        next(error)
    }
}



/* -------------------------------------------- */
/*               check user roles               */
/* -------------------------------------------- */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => { 
    if (!allowedRoles.includes(req.user.role)) {
      return next( createError(403, 'You have no permission to do this operation.'))
    }

    next()
   }
}


/* ---------------------------------------------------------------- */
/*                         EMAIL TRANSPORTER                        */
/* ---------------------------------------------------------------- */
//send confirmation email
export const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);