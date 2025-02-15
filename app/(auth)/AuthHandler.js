import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebaseconfig"; // Ensure correct import

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

        if (!userSnap.exists()) {
          console.log("📝 User does not exist. Creating entry...");

          const userData = {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "No email",
            name: user.fullName || `${user.firstName} ${user.lastName}` || "No name",
            createdAt: new Date().toISOString(),
          };

          await setDoc(userRef, userData);
          console.log("✅ User data stored:", userData);
        } else {
          console.log("✅ User already exists in Firestore.");
        }
      } catch (error) {
        console.error("❌ Error storing user data:", error);
      } finally {
        setLoading(false);
      }
    };

    storeUserData();
  }, [isSignedIn, user, pathname, navigate]);

  return (
    <div>
      <h1>AuthHandler</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default AuthHandler;
