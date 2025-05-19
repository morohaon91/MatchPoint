"use client";

import React from "react";
import { GroupWithLastGame } from "@/app/app/groups/page"; // Import the enhanced type
import ModernGroupCard from "./ModernGroupCard"; // Switch to ModernGroupCard
// Removed SportType as it's part of GroupWithLastGame now
// Removed GroupCard as it's replaced

interface GroupListProps {
  groups: GroupWithLastGame[]; // Use the enhanced type
  isLoading?: boolean; // Keep isLoading for consistency if page passes it
  // userRole, onEditGroup, onDeleteGroup are removed as ModernGroupCard might handle roles/actions differently or not need them for "view" mode
  emptyMessage?: string;
}

/**
 * GroupList component displays a list of groups using ModernGroupCard
 */
export default function GroupList({
  groups = [],
  isLoading = false, // Default to false, page will control actual loading state
  emptyMessage = "No groups found",
}: GroupListProps) {
  // Internal filtering (sportFilter, searchTerm) is removed as per plan.
  // The list now directly renders the groups passed to it.

  // useEffect for filtering is removed.

  // uniqueSports calculation is removed.

  return (
    <div className="space-y-6">
      {/* Search and filter UI elements are removed */}

      {isLoading ? ( // This isLoading is now controlled by the parent page
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {/* Consider a more modern empty state if available, or use Tailwind for styling */}
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {" "}
          {/* Adjusted grid for potentially more cards */}
          {groups.map((groupWithLastGame) => (
            <ModernGroupCard
              key={groupWithLastGame.id}
              group={groupWithLastGame} // Pass the full group object
              // memberCount is now derived within ModernGroupCard from groupWithLastGame
              // lastGame is part of groupWithLastGame, ModernGroupCard will access it
              // For memberAvatars and gamesCount, ModernGroupCard handles their absence
            />
          ))}
        </div>
      )}
    </div>
  );
}
