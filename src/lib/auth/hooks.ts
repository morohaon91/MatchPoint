/**
 * Authentication hooks for the MatchPoint app
 */

import { useState, useEffect } from "react";

// Mock user type - in a real app, this would come from Firebase Auth
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Hook to access the current authenticated user
 * @returns The current user and loading state
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, this would use Firebase Auth onAuthStateChanged
    // For now, we'll simulate a logged-in user
    const simulateAuthCheck = () => {
      setTimeout(() => {
        // Simulate a logged-in user
        setUser({
          uid: "user123",
          email: "user@example.com",
          displayName: "Demo User",
          photoURL: null,
        });
        setIsLoading(false);
      }, 1000);
    };

    simulateAuthCheck();

    // Cleanup function
    return () => {
      // In a real app, this would unsubscribe from Firebase Auth
    };
  }, []);

  return { user, isLoading };
}

/**
 * Hook to check if the current user has admin privileges
 * @returns Whether the current user is an admin
 */
export function useIsAdmin() {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!user || isLoading) return;

    // In a real app, this would check against Firestore
    // For now, we'll simulate an admin check
    const checkAdminStatus = async () => {
      // Simulate admin check
      setIsAdmin(user.email === "admin@example.com");
    };

    checkAdminStatus();
  }, [user, isLoading]);

  return { isAdmin, isLoading };
}
