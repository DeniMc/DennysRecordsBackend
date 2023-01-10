import passportJWT from "passport-jwt";
import { User } from "../models/users.model.js";


const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt; // we will not use this because our token is in req.coockies

const configureJwtStrategy = (passport) => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        // where is our token located
        jwtFromRequest: (req) => req.cookies.access_token,
        secretOrKey: process.env.JWT_SECRET,
      },
      (jwtPayload, done) => {
        // here is called serialize and deserialize

        return User.findById(jwtPayload.id)

          .select("_id")
          .then((user) => {
            // attach the user object (_id of the user) to the req object
            return done(null, user);
          })
          .catch((err) => done(err));
      }
    )
  );
};

export default configureJwtStrategy;