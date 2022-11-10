import GoogleStrategy from "passport-google-oauth20";
import UsersModel from "../../users/model.js";
import { createTokens } from './tools.js';

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLINET_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BASE_URL}/users/googleRedirect`,
  },
  async (__, ___, profile, passportNext) => {
   
    try {
      const { email, given_name, family_name } = profile._json;

      const user = await UsersModel.findOne({ email });

      if (user) {
        const { accessToken } = await createTokens(user);

        passportNext(null, { accessToken });
      } else {
        const newUser = new UsersModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleId: profile.id,
        });
        const createdUser = await newUser.save();

        const { accessToken } = await createTokens(createdUser);
        passportNext(null, { accessToken });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
