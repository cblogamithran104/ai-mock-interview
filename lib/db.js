import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './firebaseconfig';

// Initialize Firestore
const db = getFirestore(app);

export { db };