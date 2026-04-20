const express = require('express');
const passport = require('passport');
const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const { linkGithubAccount } = require('../controllers/auth.controller');

// Initiate GitHub OAuth (Web Flow)
router.get(
    '/',
    (req, res, next) => {
        const token = req.query.token;
        const stateStr = token ? token : true;
        passport.authenticate('github', { scope: ['user:email', 'repo'], state: stateStr })(req, res, next);
    }
);

// GitHub OAuth Callback (Web Flow)
router.get(
    '/callback',
    (req, res, next) => {
        passport.authenticate('github', { session: false }, (err, user, info) => {
            if (err) {
                console.error('[GitHub OAuth Error]', err.message);
                return res.redirect(`${process.env.FRONTEND_URL}/?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/?error=github_auth_failed`);
            }
            // Successful authentication, redirect to frontend dashboard
            return res.redirect(`${process.env.FRONTEND_URL}/?success=github_connected`);
        })(req, res, next);
    }
);

// Mobile Exchange Route (Expo/Mobile Flow)
// Note: Frontend calls this as POST /api/v1/auth/github
router.post('/', linkGithubAccount);
router.post('/exchange', linkGithubAccount); // Legacy support

module.exports = router;
