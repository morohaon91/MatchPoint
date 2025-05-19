"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { validateInviteCode } from "@/lib/groups/inviteUtils";
import { useAuth } from "@/lib/auth/hooks";
import { joinGroup } from "@/lib/groups/groupService";

interface InvitePageProps {
  params: {
    code: string;
  };
}

export default function InvitePage({ params }: InvitePageProps) {
  const { code } = params;
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function validateInvitation() {
      if (!code || !groupId) {
        setError("Invalid invitation link");
        setIsValidating(false);
        return;
      }

      try {
        // In a real app, this would validate against the database
        const isValid = validateInviteCode(code);

        if (isValid) {
          // Fetch group details
          // In a real app, this would come from the database
          setGroupName("Group Name"); // Placeholder
          setIsValid(true);
        } else {
          setError("This invitation link is invalid or has expired");
        }
      } catch (err) {
        console.error("Error validating invitation:", err);
        setError("Failed to validate invitation");
      } finally {
        setIsValidating(false);
      }
    }

    validateInvitation();
  }, [code, groupId]);

  const handleJoinGroup = async () => {
    if (!user || !groupId) return;

    setIsJoining(true);
    setError("");

    try {
      await joinGroup(groupId, user.uid);
      setJoined(true);

      // Redirect to group page after a short delay
      setTimeout(() => {
        router.push(`/app/groups/${groupId}`);
      }, 2000);
    } catch (err) {
      console.error("Error joining group:", err);
      setError("Failed to join group. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (isAuthLoading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Join Group</h1>
          <p className="text-gray-600 mb-6">
            You need to sign in to accept this invitation.
          </p>
          <button
            onClick={() =>
              router.push(`/login?redirect=/invite/${code}?groupId=${groupId}`)
            }
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/app/dashboard")}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Successfully Joined!
          </h1>
          <p className="text-gray-600 mb-6">
            You have successfully joined {groupName}. Redirecting you to the
            group page...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="rounded-full bg-blue-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join {groupName}</h1>
          <p className="text-gray-600 mt-2">
            You&apos;ve been invited to join this group on MatchPoint
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-medium">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500">
                You&apos;ll join as this user
              </p>
            </div>
          </div>

          <button
            onClick={handleJoinGroup}
            disabled={isJoining}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Joining...
              </>
            ) : (
              "Join Group"
            )}
          </button>

          <button
            onClick={() => router.push("/app/dashboard")}
            disabled={isJoining}
            className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
