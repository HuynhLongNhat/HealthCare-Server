const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const db = require("../models/index");
const { Op } = require("sequelize");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        
        // Check if user already exists
        let user = await db.users.findOne({ 
          where: { 
            googleId: profile.id 
          } 
        });
        if (!user && profile.emails && profile.emails.length > 0) {
          user = await db.users.findOne({ 
            where: { 
              email: profile.emails[0].value 
            } 
          });
          
          // If found by email but no googleId, update the user
          if (user && !user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // If still not found, create a new user
        if (!user) {
          const email = profile.emails && profile.emails.length > 0 
            ? profile.emails[0].value 
            : `${profile.id}@google.com`;
            
          const photoUrl = profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null;
          user = await db.users.create({
            googleId: profile.id,
            email: email,
            full_name: profile.displayName,
            profile_picture: photoUrl,
            is_verified: true,
            role_id: 3, 
            uuid: require("uuid").v4(),
            username: `google_${profile.id}`,
            password: null,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db.users.findOne({
        where: {
          [Op.or]: [
            { facebookId: profile.id },
            { email: profile.emails[0].value }
          ]
        }
      });

      if (!user) {
        user = await db.users.create({
          facebookId: profile.id,
          email: profile.emails[0].value,
          full_name: profile.displayName,
          profile_picture: profile.photos[0].value,
          is_verified: true,
          role_id: 3,
          uuid: require("uuid").v4(),
          username: `fb_${profile.id}`,
          password: null
        });
      } else if (!user.facebookId) {
        user.facebookId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.users.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});