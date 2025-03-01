"use client"

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-lg mb-6">The page you are looking for does not exist.</p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
import { db } from "../lib/firebaseconfig"; // ✅ Ensure correct import path
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, "Users")); // ✅ Matches "Users" collection
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      {users.length > 0 ? (
        users.map((user) => (
          <p key={user.id}>
            {user.name || "Unknown"} - {user.email || "No Email"}
          </p>
        ))
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
