import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './firebaseconfig';

// Initialize Firestore
const db = getFirestore(app);

// Helper function to insert documents
const insert = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { mockId: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

export { db, insert };