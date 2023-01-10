import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { User } from "../models/users.model.js";
import { Token } from "../models/tokens.model.js";
import { transporter } from '../middlewares/auth.middleware.js';
import { verify_message } from '../utils/templates.js';
import sgMail from "@sendgrid/mail";

dotenv.config();

/* -------------------------------------------- */
/*                    SIGN-UP                   */
/* -------------------------------------------- */
export const signup = async (req, res, next) => {
    try {
      //validation results handling
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .send({ message: "invalid data", errors: errors.array() });
      }

      //destructure the request body
      const { name, username, email, password, confirm } = req.body;

      if (!password || !username || !name || !email || !confirm) {
        return next(
          createError(
            400,
            `Please fillout the required (*) fields for sign-up!`
          )
        );
      }

      //create the user
      const newUser = await User.create({
        name,
        username,
        email,
        password,
        confirm,
      });

      let token;
      if (newUser) {
        token = jwt.sign({ userid: newUser.id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        //remove password from result set (to avoid send it to frontend)
        newUser.password = undefined;
      }

      /**
       * For email verification
       * 1. create a random token and insert it into db
       * 2. create a model for token that contains tokens owner and token itself
       * 3. send a link to front end that contains the userid and the random token    http://localhost:5000/api/verify/userid/verificationtoken
       * 4. when the user clicks on the link our backend receive another request for verification so defin route for it
       * 5. verfication controller should check the user id and random token
       * 6. if userid and token are valid user if verified and token can be deleted
       */
      
      //create random token for email verification
      //insert random token to db
      const verification_token = await Token.create({
        userid: newUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      });

      //verify link that will send to new user's email address. e.g.    http://localhost:5000/api/verify/userid/verificationtoken
      const verifyLink = `${process.env.BASE_URL}/api/verify/${newUser._id}/${verification_token.token}`;

      console.log(verifyLink);

      //send email
      await transporter.sendMail({
        from: "denis.mcardle@dci.education",
        to: email,
        subject: "Welcome to our App!",
        html: verify_message(verifyLink, newUser.name), //verify_message() will return a html template contains verify_link and name of the user
      });

      //send response
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .send({ message: "create new user", data: newUser });
    } catch (error) {
        next(error)
    }
}


/* ---------------------------------------------------------------- */
/*                        EMAIL VERIFICATION                        */
/* ---------------------------------------------------------------- */
export const verification = async (req, res, next) => {
    try {
        const { userid, verifytoken } = req.params;

        //check the userid
        const user = await User.findById(userid);
        if (!user) return next(createError(400, 'Inavlid Link because of wrong userid.'));

        const tokenInDB = await Token.findOne({ userid: userid, token: verifytoken });
        if (!tokenInDB) return next(createError(400, 'Invalid Link because of wrong userid and verify token'))
        
        await User.findByIdAndUpdate(userid, { isVerified: true });
        await Token.findByIdAndDelete(tokenInDB._id);

        res.send('You verified successfully!');
    } catch (error) {
        next(error)
    }
}

/* -------------------------------------------- */
/*                    SIGN-IN                   */
/* -------------------------------------------- */
export const signin = async (req, res, next) => {
    try {
        //destructure the body
        const { email, password } = req.body;
        
        //if email or password not exist
        if (!email || !password) {
            return next(createError(400, 'Please provide email and password for login'))
        }

        //1. find a user with given email
        const user = await User.findOne({ email }).select('+password');
        
        //2. compare given password with hashed value
        if (user && await user.checkPassword(password, user.password)) {
            
            //create the token
            const token = jwt.sign(
                { userid: user._id },       //payload
                process.env.JWT_SECRET,     //secret key
                { expiresIn: '1d' }         //expiration
                );
                
            user.password = undefined;  //remove password (shouldn't send password to frontend)

            res
              .cookie("access_token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
              })
              .send({ message: "login success", data: user });
       
        } else {
            res.status(401).send({
                message: 'Authentication failed',
                error: 'Username or Password is not valid'
            })
        }
   
    }catch(error){
        next(error)
    }
}


/* -------------------------- UPDATE USER ------------------------- */
export const updateUser = async (req, res, next) => {
    try {
    
        let updatedUser;
        if (req.body.password) {
            const hashedPass = await bcrypt.hash(req.body.password, 12);
            updatedUser = await User.findByIdAndUpdate(
                req.params.uid,                                                 //updated user
                { ...req.body, password: hashedPass, changedAt: Date.now() },   //updating data
                { new: true }                                                   //return updated data
            );

            
        } else {
            updatedUser = await User.findByIdAndUpdate(req.params.uid, {...req.body}, {new: true});
        }
        
        res.send({ message: 'user updated', data: { updatedUser }});

    } catch (error) {
        next(error)
    }
}


/* ---------------------------------------------------------------- */
/*                         send simple email                        */
/* ---------------------------------------------------------------- */
export const sendEmail = async (req, res, next) => {
    try {
        
        //get info (subject, receiver, message)
        const { subject, receiver, message } = req.body;

        //send email
       await transporter.sendMail({
            to: receiver,
            from: 'denis.mcardle@dci.education',
            subject: subject,
           html: message,
            
       });
        
        res.send("Email sent!")


        

    } catch (error) {
        next(error)
    }
};


// //! send email by sendGrid when the user contact us

export const contactUs = async (req, res, next) => {
  const {username, email, message} = req.body;

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    from: "denis.mcardle@dci.education",
    to: email,
    subject: message,
    text: "very simple email sys ",
    html: `<strong>Hello there ${username}</strong>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("msg sent");
      res.json({msg: "Email Successfully sent! Thanks."});
    })
    .catch((err) => console.log(err));
};


