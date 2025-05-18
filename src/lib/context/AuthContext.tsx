"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { DefaultCookieManager } from "../cookies/DefaultCookieManager";
import { AuthService } from "../auth/AuthService";

type UserClaims = {
  [key: string]: any;
};

interface AuthContextType {
  currentUser: User | null;
  userClaims: UserClaims | null;
  isLoadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userClaims: null,
  isLoadingAuth: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  authService: AuthService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authService,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      // setIsLoadingAuth(false); // Moved down

      if (user) {
        try {
          // Call getUserClaims without forcing refresh by default.
          // The second argument (forceRefresh) is now optional and defaults to false in AuthService.
          const claims = await authService.getUserClaims(user);
          setUserClaims(claims);
          DefaultCookieManager.addAuthCookie(user.uid);
        } catch (error) {
          console.error("Failed to get user claims:", error);
          setUserClaims(null); // Ensure claims are cleared on error
        }
      } else {
        setUserClaims(null);
        DefaultCookieManager.removeAuthCookie();
      }
      setIsLoadingAuth(false); // Set loading to false after all auth operations
    });

    return () => unsubscribe();
  }, [authService]); // Keep dependencies minimal unless others are truly needed for this effect's logic

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!currentUser && pathname.startsWith("/app")) {
      router.push("/login");
    } else if (currentUser && pathname.startsWith("/login")) {
      router.push("/app/dashboard");
    }
  }, [currentUser, pathname, router, isLoadingAuth]);

  const value = {
    currentUser,
    userClaims,
    isLoadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
