const { db } = require("./firebase");
const { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } = require("firebase/firestore");

// Collection Name
const usersCollection = "users";

// Create a user
async function createUser(userData) {
  const docRef = await addDoc(collection(db, usersCollection), userData);
  return docRef.id;
}

// Get all users
async function getUsers() {
  const querySnapshot = await getDocs(collection(db, usersCollection));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get a single user
async function getUserById(userId) {
  const docRef = doc(db, usersCollection, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

// Update a user
async function updateUser(userId, updatedData) {
  const docRef = doc(db, usersCollection, userId);
  await updateDoc(docRef, updatedData);
}

// Delete a user
async function deleteUser(userId) {
  const docRef = doc(db, usersCollection, userId);
  await deleteDoc(docRef);
}

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
