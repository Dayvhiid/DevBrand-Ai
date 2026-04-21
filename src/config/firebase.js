const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The most robust way to handle Firebase private keys in .env
    privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim()
        : undefined,
};

if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
    console.warn('[Firebase] Warning: Firebase credentials not fully configured in .env');
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
        console.log('[Firebase] Admin SDK initialized successfully');
    } catch (error) {
        console.error('[Firebase] Initialization error:');
        console.error('- Project ID:', firebaseConfig.projectId);
        console.error('- Client Email:', firebaseConfig.clientEmail);
        console.error('- Private Key Header:', firebaseConfig.privateKey ? firebaseConfig.privateKey.substring(0, 30) + '...' : 'MISSING');
        console.error('- Error:', error.message);
    }
}


module.exports = admin;
