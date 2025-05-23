"use client";

import React, { useEffect, useState } from "react";
import SmartDashboard from "@/components/dashboard/SmartDashboard";
import {
  User,
  Game,
  Group,
  SportType,
  GameStatus,
  UserRole,
} from "@/lib/types/models";
import { useAuth } from "@/lib/context/AuthContext"; // Import real AuthContext
import { getUserUpcomingGames } from "@/lib/games/gameService"; // Import game service
import {
  getUserGroups,
  getPendingGroupInvitesForUser,
  acceptGroupInvite,
} from "@/lib/groups/groupService"; // Import group services
import GroupSelectionModal from "@/components/groups/GroupSelectionModal";
import { toast } from "react-hot-toast";

// Placeholder loading component
const DashboardLoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-6 lg:col-span-2">
        <div className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      </div>
      <div className="space-y-6 lg:col-span-1">
        <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        <div className="h-72 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { currentUser, isLoadingAuth } = useAuth(); // Use real auth context
  const [pageSpecificUser, setPageSpecificUser] = useState<User | null>(null); // For adapting authUser to User type
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [pendingGroupInvites, setPendingGroupInvites] = useState<Group[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Renamed from isLoading to avoid conflict
  const [error, setError] = useState<string | null>(null);
  const [isGroupSelectionModalOpen, setIsGroupSelectionModalOpen] =
    useState(false);

  // Function to load user groups
  const loadUserGroups = async () => {
    if (!currentUser?.uid) return;
    try {
      const groups = await getUserGroups(currentUser.uid);
      setUserGroups(groups);
    } catch (error) {
      console.error("Error loading user groups:", error);
    }
  };

  useEffect(() => {
    if (isLoadingAuth) {
      setIsLoadingData(true);
      return;
    }

    if (!currentUser) {
      // AuthProvider should handle redirect to login if not authenticated.
      // If we reach here and authUser is null, it means AuthProvider might allow non-logged-in users
      // on this page, or there's a delay. For now, we'll stop data loading.
      console.log("DashboardPage: User not authenticated by AuthContext.");
      setIsLoadingData(false);
      setPageSpecificUser(null); // Ensure pageSpecificUser is also null
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      setError(null);
      try {
        // Adapt the Firebase User (authUser) to your application's User type
        // This is a simplified adaptation. You might need more fields or logic.
        const fetchedAppUser: User = {
          id: currentUser.uid,
          email: currentUser.email || "default@example.com",
          displayName: currentUser.displayName || "User",
          photoURL: currentUser.photoURL || undefined,
          role: UserRole.USER, // Default role, consider fetching actual role if stored
          createdAt: new Date(), // Placeholder, ideally from user profile in DB
          updatedAt: new Date(), // Placeholder
          isActive: true, // Placeholder
          sportPreferences: [{ sport: SportType.TENNIS, skillLevel: 3 }], // Example preference
        };
        setPageSpecificUser(fetchedAppUser);

        // --- Fetching real data from Firestore ---
        const [games, groups, invites] = await Promise.all([
          getUserUpcomingGames(currentUser.uid),
          getUserGroups(currentUser.uid),
          getPendingGroupInvitesForUser(currentUser.uid),
        ]);

        setUserGames(games);
        setUserGroups(groups);
        setPendingGroupInvites(invites);
        // --- End fetching real data ---
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard. Please try again later.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [currentUser, isLoadingAuth]);

  // Placeholder handler functions
  const handleAcceptGroupInvite = async (groupId: string) => {
    try {
      if (!currentUser?.uid) {
        throw new Error("You must be logged in to accept invites");
      }

      await acceptGroupInvite(groupId, currentUser.uid);
      
      // Update local state
      setPendingGroupInvites((prev) => prev.filter((g) => g.id !== groupId));
      
      // Refresh user groups to include the newly joined group
      await loadUserGroups();
      
      toast.success("You have successfully joined the group!");
    } catch (error) {
      console.error("Failed to accept invite:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept invite");
    }
  };

  const handleDeclineGroupInvite = async (groupId: string) => {
    console.log(`Declined invite for group: ${groupId}`);
    // TODO: Implement Firebase logic to decline invite
    // Example: remove from invitedUserIds
    setPendingGroupInvites((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleOpenCreateGameModal = () => {
    console.log("Opening group selection modal");
    setIsGroupSelectionModalOpen(true);
  };

  const handleCloseGroupSelectionModal = () => {
    setIsGroupSelectionModalOpen(false);
  };

  if (isLoadingAuth || isLoadingData) {
    // Check both auth loading and data loading
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-error-500">
        {error}
      </div>
    );
  }

  if (!currentUser || !pageSpecificUser) {
    // Check authUser from context and the derived pageSpecificUser
    // AuthProvider should redirect to login. If not, show a message.
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Please log in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SmartDashboard
        currentUser={pageSpecificUser} // Pass the adapted User object
        userGames={userGames}
        pendingGroupInvites={pendingGroupInvites}
        userGroups={userGroups}
        // Pass handler functions
        onAcceptGroupInvite={handleAcceptGroupInvite}
        onDeclineGroupInvite={handleDeclineGroupInvite}
        onOpenCreateGameModal={handleOpenCreateGameModal}
      />

      {/* Group Selection Modal */}
      <GroupSelectionModal
        groups={userGroups}
        isOpen={isGroupSelectionModalOpen}
        onClose={handleCloseGroupSelectionModal}
      />
    </div>
  );
}
