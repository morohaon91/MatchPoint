"use client";

import PasswordResetForm from "@/components/auth/PasswordResetForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Suspense } from "react";

export default function PasswordResetPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size={32} />
          </div>
        }
      >
        <PasswordResetForm />
      </Suspense>
    </main>
  );
}
