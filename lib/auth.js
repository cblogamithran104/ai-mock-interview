import { useUser as useClerkUser } from "@clerk/nextjs";

export const useUser = () => {
  const { user, isLoaded } = useClerkUser();
  
  return {
    user,
    isLoaded,
    isSignedIn: !!user
  };
};