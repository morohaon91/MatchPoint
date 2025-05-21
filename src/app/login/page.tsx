"use client";

import { AuthGate } from "@/lib/context/AuthGate";
import { useAuth } from "@/lib/context/AuthContext";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { currentUser } = useAuth();

  // Redirect if user is already logged in
  if (currentUser) {
    redirect("/app/dashboard");
  }

  return (
    <AuthGate>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6 lg:p-8">
        <LoginForm />
      </main>
    </AuthGate>
  );
}
