"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import toast from "react-hot-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseClient";
import { useRouter } from "next/navigation";
import { signIn, SignInMethod } from "@/lib/firebase/signin";
import signUp from "@/lib/firebase/signup";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link"; // For "Forgot password?" if it becomes a NextLink

enum FormMode {
  Login,
  Register,
}

export default function LoginForm() {
  // Renamed component to match filename
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(FormMode.Login);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For button loading states
  const router = useRouter();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, error: signInError } = await signIn(SignInMethod.Google, {
        signupCallback: async (userCredential) => {
          // When a new user signs up, call the signup endpoint
          await fetch("/api/users/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              name: userCredential.user.displayName,
            }),
          });
        },
      });
      if (user) {
        router.push("/app/dashboard");
      } else if (signInError) {
        toast.error(signInError);
        setError(signInError);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error("An unexpected error occurred during Google sign-in");
      setError("An unexpected error occurred during Google sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, error: signInError } = await signIn(
        SignInMethod.EmailPassword,
        {
          credentials: {
            email,
            password,
          },
          // No signupCallback needed here as login shouldn't create a new user record via this path
        },
      );
      if (user) {
        router.push("/app/dashboard");
      } else if (signInError) {
        toast.error(signInError);
        setError(signInError);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred during login");
      setError("An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { user, error: signUpError } = await signUp(email, password); // Assuming signUp handles the /api/users/signup call or it's done separately
      if (user) {
        // Call the signup endpoint after successful Firebase user creation
        // Assuming 'user' from signUp might be UserCredential, or User. If UserCredential, it's user.user.
        // If 'user' is already the User object, then user.uid is correct.
        // Given the TS error, let's assume 'user' here is actually a UserCredential object.
        const firebaseUser = user.user; // Access the User object from UserCredential
        await fetch("/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName, // displayName might be null initially, handle in API
          }),
        });
        router.push("/app/dashboard");
      } else if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.message || "An unexpected error occurred during registration",
      );
      toast.error(
        err.message || "An unexpected error occurred during registration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // e.preventDefault(); // Not needed if it's a button type="button"
    if (!email) {
      toast.error("Please enter your email address to reset password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formMode === FormMode.Login) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">
          {formMode === FormMode.Login ? "Welcome Back!" : "Create an Account"}
        </CardTitle>
        <CardDescription>
          {formMode === FormMode.Login
            ? "Enter your credentials to access your account."
            : "Fill in the details below to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-center text-error">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {formMode === FormMode.Login && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs h-auto"
                  onClick={handleForgotPassword}
                  disabled={isLoading || !email}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {formMode === FormMode.Register && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              (formMode === FormMode.Login && (!email || !password)) ||
              (formMode === FormMode.Register &&
                (!email || !password || !confirmPassword))
            }
          >
            {isLoading
              ? "Processing..."
              : formMode === FormMode.Login
                ? "Login"
                : "Create Account"}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2 h-4 w-4" />
          {formMode === FormMode.Login
            ? "Sign in with Google"
            : "Sign up with Google"}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pt-4">
        <Button
          variant="link"
          onClick={() => {
            setFormMode(
              formMode === FormMode.Login ? FormMode.Register : FormMode.Login,
            );
            setError(null);
          }}
          disabled={isLoading}
          className="text-sm text-muted-foreground"
        >
          {formMode === FormMode.Login
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Button>
      </CardFooter>
    </Card>
  );
}
