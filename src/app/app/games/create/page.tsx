"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import ModernGameForm from "@/components/games/ModernGameForm";
import { Game, RecurringSeries } from "@/lib/types/models"; // Assuming GameFormData is part of GameForm or defined here
import { Timestamp } from "firebase/firestore"; // For converting dates
import { useAuth } from "@/lib/context/AuthContext";

// No need for custom interface as ModernGameForm uses Partial<Game> directly

export default function CreateGamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get("groupId");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!groupId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Error: Group ID is missing
        </h1>
        <p>
          A groupId is required to create a new game. Please go back and select
          a group.
        </p>
        <button
          onClick={() => router.push("/app/groups")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const handleGameSubmit = async (formData: Partial<Game>) => {
    setIsSubmitting(true);
    setError(null);

    // Basic validation (groupId should always be present here)
    if (!groupId) {
      setError("Group ID is missing. Cannot create game.");
      setIsSubmitting(false);
      return;
    }

    // Construct the payload for the API
    // ModernGameForm already includes isRecurring in the formData
    const payload = {
      ...formData,
      groupId,
      // Make sure isOpenToGuests is included in the payload
      isOpenToGuests: formData.isOpenToGuests || false,
      // The API route will set createdBy, createdAt, status, currentParticipants
    };

    try {
      const response = await fetch("/api/games/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await currentUser?.getIdToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);

        // Handle specific error cases
        if (response.status === 403) {
          // Permission error
          throw new Error(
            errorData.error ||
              "You don't have permission to create games in this group. You need to be an admin or organizer."
          );
        } else {
          throw new Error(errorData.error || "Failed to create game");
        }
      }

      const result = await response.json();
      console.log("Game created successfully:", result);

      if (!result.gameId) {
        // If the API doesn't return a gameId, something went wrong
        throw new Error(
          "Game creation failed: No game ID returned from server"
        );
      }

      // Set success state
      setCreatedGameId(result.gameId);
      setSuccessMessage(`Game "${formData.title}" created successfully!`);

      // Verify the game was created by fetching it
      try {
        const verifyResponse = await fetch(`/api/games/${result.gameId}`, {
          headers: {
            Authorization: `Bearer ${await currentUser?.getIdToken()}`,
          },
        });

        if (!verifyResponse.ok) {
          console.warn(
            "Game created but verification failed:",
            await verifyResponse.text()
          );
        } else {
          console.log("Game creation verified successfully");
        }
      } catch (verifyError) {
        console.warn("Error verifying game creation:", verifyError);
        // Continue with success message even if verification fails
      }

      // Wait 2 seconds before redirecting to allow user to see success message
      setTimeout(() => {
        router.push(`/app/games/${result.gameId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating game:", err);
      setError(
        err.message ||
          "An unexpected error occurred. Please check the console for more details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2 text-gray-800">Create New Game</h1>
      <p className="mb-6 text-gray-600">
        Organize a new event for your group:{" "}
        <span className="font-semibold text-blue-600">{groupId}</span>
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Error: {error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
              <p className="text-xs mt-1">Redirecting to game page...</p>
            </div>
          </div>
        </div>
      )}

      <ModernGameForm
        initialData={{ groupId }}
        onSubmit={handleGameSubmit}
        isLoading={isSubmitting}
        onCancel={() => router.back()} // Or router.push(`/app/groups/${groupId}`)
      />
    </div>
  );
}
