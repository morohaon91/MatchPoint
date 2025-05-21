// lib/context/AuthGate.tsx
"use client";

import { useAuth } from "@/lib/context/AuthContext";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};
