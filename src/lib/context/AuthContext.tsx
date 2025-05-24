"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { DefaultCookieManager } from "../cookies/DefaultCookieManager";
import { AuthService } from "../auth/AuthService";
import { checkProfileComplete } from "../firebase/userProfile";

type UserClaims = {
  [key: string]: any;
};

interface AuthContextType {
  currentUser: User | null;
  userClaims: UserClaims | null;
  isLoadingAuth: boolean;
  isProfileComplete: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userClaims: null,
  isLoadingAuth: true,
  isProfileComplete: false,
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
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const claims = await authService.getUserClaims(user);
          setUserClaims(claims);
          DefaultCookieManager.addAuthCookie(user.uid);

          // Check profile completion
          const profileComplete = await checkProfileComplete(user.uid);
          setIsProfileComplete(profileComplete);
        } catch (error) {
          console.error("Failed to get user data:", error);
          setUserClaims(null);
          setIsProfileComplete(false);
        }
      } else {
        setUserClaims(null);
        setIsProfileComplete(false);
        DefaultCookieManager.removeAuthCookie();
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [authService]);

  useEffect(() => {
    if (isLoadingAuth) return;

    if (!currentUser && pathname.startsWith("/app")) {
      router.push("/login");
    } else if (currentUser) {
      if (!isProfileComplete && !pathname.startsWith("/onboarding")) {
        router.push("/onboarding");
      } else if (isProfileComplete && pathname.startsWith("/login")) {
        router.push("/app/dashboard");
      }
    }
  }, [currentUser, pathname, router, isLoadingAuth, isProfileComplete]);

  const value = {
    currentUser,
    userClaims,
    isLoadingAuth,
    isProfileComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
