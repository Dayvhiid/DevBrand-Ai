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

// @desc    Link GitHub account (Mobile/Expo)
// @route   POST /api/v1/auth/github/exchange
// @access  Private
const linkGithubAccount = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'No code provided' });
    }

    try {
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
                redirect_uri: process.env.GITHUB_CALLBACK_URL,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.status(400).json({ message: tokenData.error_description || 'GitHub exchange failed' });
        }

        // 2. Fetch user profile from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const profile = await userResponse.json();

        // 3. Find user and update
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.githubId = profile.id.toString();
        user.githubAccessToken = tokenData.access_token;
        user.githubRefreshToken = tokenData.refresh_token;
        user.githubProfile = {
            username: profile.login,
            displayName: profile.name,
            profileUrl: profile.html_url,
            avatarUrl: profile.avatar_url,
        };

        await user.save();

        res.status(200).json({
            message: 'GitHub connected successfully',
            githubConnected: true,
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
