import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";

const AuthHandler = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  console.log("✅ AuthHandler mounted");
  console.log("➡️ isSignedIn:", isSignedIn);
  console.log("➡️ user:", user);

  useEffect(() => {
    const storeUserData = async () => {
      if (!isSignedIn || !user) {
        console.log("❌ User is not signed in or missing.");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Checking if user exists in Firestore...");
        const userRef = doc(db, "Users", user.id);
        const userSnap = await getDoc(userRef);

        // Prepare user data with proper checks
        const userData = {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
          lastSignIn: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...(!userSnap.exists() && { createdAt: serverTimestamp() }), // Only add createdAt for new users
        };

        // Always update user data to keep it fresh
        await setDoc(userRef, userData, { merge: true });
        console.log("✅ User data updated:", userData);

      } catch (error) {
        console.error("❌ Error storing user data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn && user) {
      storeUserData();
    }
  }, [isSignedIn, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>AuthHandler</h1>
      {isSignedIn && user && (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      )}
    </div>
  );
};

export default AuthHandler;
