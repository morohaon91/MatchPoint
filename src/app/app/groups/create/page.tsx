"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Group } from "@/lib/types/models";
import ModernGroupForm from "@/components/groups/ModernGroupForm";
import { createGroup } from "@/lib/services";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function CreateGroupPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleSubmit = async (groupData: Partial<Group>) => {
    if (!currentUser) {
      setError("You must be logged in to create a group");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const newGroup = await createGroup(
        {
          name: groupData.name || "",
          description: groupData.description || "",
          sport: groupData.sport!,
          isPublic: groupData.isPublic || false,
          location: groupData.location || "",
          photoURL: groupData.photoURL || undefined, // Corrected from null to undefined
          invitationCode: groupData.invitationCode, // Pass invitationCode
        },
        currentUser.uid
      );

      // Redirect to the new group's page
      router.push(`/app/groups/${newGroup.id}`);
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Failed to create group. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/app/groups"
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
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
        Back to Groups
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {/* Create New Group */}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <ModernGroupForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/app/groups")}
        isLoading={isSubmitting}
      />
    </div>
  );
}
