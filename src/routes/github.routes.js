const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate GitHub OAuth
router.get(
    '/',
    passport.authenticate('github', { scope: ['user:email', 'repo'], state: true }) // 'repo' scope needed for ingestion later
);

// GitHub OAuth Callback
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

module.exports = router;
