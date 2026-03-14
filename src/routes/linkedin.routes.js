const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate LinkedIn OAuth
router.get(
    '/',
    passport.authenticate('linkedin', { state: true })
);

// LinkedIn OAuth Callback
router.get(
    '/callback',
    (req, res, next) => {
        passport.authenticate('linkedin', { session: false }, (err, user, info) => {
            if (err) {
                console.error('[LinkedIn OAuth Error]', err.message);
                return res.redirect(`${process.env.FRONTEND_URL}/?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/?error=linkedin_auth_failed`);
            }
            // Successful authentication, onboarding complete
            return res.redirect(`${process.env.FRONTEND_URL}/?success=linkedin_connected`);
        })(req, res, next);
    }
);

module.exports = router;
