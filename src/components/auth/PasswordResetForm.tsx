"use client";

import { auth } from "@/lib/firebase/firebaseClient";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

export default function PasswordResetForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!oobCode) {
      toast.error("Invalid or missing password reset code.");
      setError("Invalid or missing password reset code.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters long.");
      setError("Password should be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode as string);
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      toast.success(
        "Password has been reset successfully! You can now login with your new password.",
      );
      setSuccessMessage(
        "Password has been reset successfully! Redirecting to login...",
      );
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(
        err.message ||
          "Failed to reset password. The link may be invalid or expired.",
      );
      setError(
        err.message ||
          "Failed to reset password. The link may be invalid or expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    // This case should ideally be handled by the page or a higher-level component
    // if the form is only shown when oobCode is present.
    // For now, render a message within the card.
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The password reset link is invalid or missing. Please request a new
            one if needed.
          </p>
          <Link href="/login" passHref legacyBehavior>
            <Button variant="link" className="mt-4">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (successMessage) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Reset Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-success">{successMessage}</p>{" "}
          {/* Ensure 'text-success' is defined or use a themed color like 'text-green-600' */}
          <Link href="/login" passHref legacyBehavior>
            <Button variant="primary" className="mt-4 w-full">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Reset Your Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          {error && <p className="text-sm text-center text-error">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !newPassword || !confirmNewPassword}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
