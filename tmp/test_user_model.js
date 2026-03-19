const mongoose = require('mongoose');
const User = require('../src/models/User');

async function testUserModel() {
    try {
        console.log('Testing User Model with new fields...');
        
        // Create a dummy user
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            githubId: 'gh_123',
            githubAccessToken: 'gh_access_token',
            githubRefreshToken: 'gh_refresh_token',
            githubProfile: {
                username: 'gh_user',
                displayName: 'GitHub User',
                profileUrl: 'https://github.com/gh_user',
                avatarUrl: 'https://github.com/gh_user.png',
            },
            linkedinId: 'li_123',
            linkedinAccessToken: 'li_access_token',
            linkedinRefreshToken: 'li_refresh_token',
            linkedinProfile: {
                displayName: 'LinkedIn User',
                avatarUrl: 'https://linkedin.com/li_user.png',
            },
        };

        const user = new User(userData);
        
        console.log('User object created:', user);
        
        // Verify fields
        if (user.githubRefreshToken !== 'gh_refresh_token') throw new Error('githubRefreshToken failed');
        if (user.githubProfile.username !== 'gh_user') throw new Error('githubProfile.username failed');
        if (user.linkedinRefreshToken !== 'li_refresh_token') throw new Error('linkedinRefreshToken failed');
        if (user.linkedinProfile.displayName !== 'LinkedIn User') throw new Error('linkedinProfile.displayName failed');
        
        console.log('✅ User model fields verified successfully (object-level)!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testUserModel();
