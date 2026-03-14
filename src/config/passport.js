const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            passReqToCallback: true, // Allows us to access the request object to get the JWT cookie
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Here we assume the user is already logged in and we have their user info in req.user
                // Or we extract the JWT from the cookie to find the user
                let token = req.cookies?.jwt;
                if (!token) {
                    return done(new Error('No JWT token found, please login first'), null);
                }

                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);

                if (!user) {
                    return done(new Error('User not found'), null);
                }

                user.githubId = profile.id;
                user.githubAccessToken = accessToken;

                // Only save if something actually changed to avoid duplicate key errors
                if (user.isModified()) {
                    await user.save();
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

passport.use(
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: process.env.LINKEDIN_CALLBACK_URL,
            scope: ['openid', 'profile', 'email'],
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let token = req.cookies?.jwt;
                if (!token) {
                    return done(new Error('No JWT token found, please login first'), null);
                }

                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);

                if (!user) {
                    return done(new Error('User not found'), null);
                }

                user.linkedinId = profile.id;
                user.linkedinAccessToken = accessToken;
                await user.save();

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
