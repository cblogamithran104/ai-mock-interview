// Import necessary modules
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Get Firestore instance
const db = admin.firestore();

// API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email } = req.body;
      // Add a new document with a generated ID
      const docRef = await db.collection('users').add({ name, email });
      // Respond with the document ID
      res.status(200).json({ id: docRef.id });
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(500).json({ error: 'Failed to add user' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
