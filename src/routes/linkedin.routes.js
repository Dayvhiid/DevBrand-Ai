const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate LinkedIn OAuth
router.get(
    '/',
    (req, res, next) => {
        const token = req.query.token;
        const stateStr = token ? token : true;
        passport.authenticate('linkedin', { state: stateStr })(req, res, next);
    }
);

// LinkedIn OAuth Callback
router.get(
    '/callback',
    (req, res, next) => {
        passport.authenticate('linkedin', { session: false }, (err, user, info) => {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const target = new URL(frontendUrl);

            if (err) {
                console.error('[LinkedIn OAuth Error]', err.message);
                target.searchParams.set('error', err.message);
                return res.redirect(target.toString());
            }
            if (!user) {
                target.searchParams.set('error', 'linkedin_auth_failed');
                return res.redirect(target.toString());
            }
            // Successful authentication, onboarding complete
            target.searchParams.set('success', 'linkedin_connected');
            return res.redirect(target.toString());
        })(req, res, next);
    }
);

module.exports = router;
