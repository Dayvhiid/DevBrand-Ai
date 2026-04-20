const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
        });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                _id: user._id,
                email: user.email,
                token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.status(200).json({
                _id: user._id,
                email: user.email,
                token,
                githubConnected: !!user.githubId,
                linkedinConnected: !!user.linkedinId,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.status(200).json({ message: 'User logged out' });
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            _id: user._id,
            email: user.email,
            githubConnected: !!user.githubId,
            linkedinConnected: !!user.linkedinId,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Link GitHub account or Login via GitHub (Mobile/Expo)
// @route   POST /api/v1/auth/github
// @access  Public (Identification handled via GitHub code)
const linkGithubAccount = async (req, res) => {
    const { code, redirect_uri } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'No code provided' });
    }

    try {
        console.log(`[GitHub Mobile] Exchanging code: ${code.substring(0, 5)}...`);
        
        // 1. Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirect_uri || process.env.GITHUB_CALLBACK_URL,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('[GitHub Exchange Error]', tokenData.error, tokenData.error_description);
            return res.status(400).json({ message: tokenData.error_description || 'GitHub exchange failed' });
        }

        // 2. Fetch user profile from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profile = await userResponse.json();
        const githubId = profile.id.toString();

        // 3. Find user
        let user;
        
        // If we have a req.user (e.g. from a cookie or if the frontend DID send a token), use it
        if (req.user) {
            user = await User.findById(req.user._id);
        } else {
            // Otherwise, find user by GitHub ID
            user = await User.findOne({ githubId });
            
            // If not found by GitHub ID, try finding by email (if available from GitHub)
            if (!user && profile.email) {
                user = await User.findOne({ email: profile.email.toLowerCase() });
            }
        }

        if (!user) {
            // For now, we require an existing user to link to. 
            // Alternatively, we could create a new user here.
            return res.status(404).json({ 
                message: 'No associated user found. Please register or login with email first to link your GitHub account.',
                githubProfile: profile 
            });
        }

        // 4. Update user with GitHub info
        user.githubId = githubId;
        user.githubAccessToken = tokenData.access_token;
        user.githubRefreshToken = tokenData.refresh_token;
        user.githubProfile = {
            username: profile.login,
            displayName: profile.name || profile.login,
            profileUrl: profile.html_url,
            avatarUrl: profile.avatar_url,
        };

        await user.save();

        // 5. Generate a fresh session token
        const token = generateToken(user._id);

        console.log(`[GitHub Mobile] Success for user: ${user.email}`);

        res.status(200).json({
            message: 'GitHub connected successfully',
            token,
            user: {
                _id: user._id,
                email: user.email,
                githubConnected: true,
                linkedinConnected: !!user.linkedinId,
            }
        });
    } catch (error) {
        console.error('[GitHub Exchange Error]', error);
        res.status(500).json({ message: 'Internal server error during GitHub exchange' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    linkGithubAccount,
};
