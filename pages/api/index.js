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
