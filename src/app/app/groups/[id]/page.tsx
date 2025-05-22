"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  CSSProperties,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Group, GroupMember, Game, User, ParticipantStatus } from "@/lib/types/models";
import MembersList from "@/components/groups/MembersList";
import GameList from "@/components/games/GameList";
import ModernGameForm from "@/components/games/ModernGameForm";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { firestoreConverter } from "@/lib/firebase/converters";

const GroupDetailsPage: React.FC = () => {
  const params = useParams();
  const groupId = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"games" | "members" | "settings">(
    "games"
  );
  const [showCreateGameForm, setShowCreateGameForm] = useState(false);

  // Firestore References
  const groupRef = useMemo(
    () => doc(db, "groups", groupId).withConverter(firestoreConverter<Group>()),
    [groupId]
  );
  const gamesCollectionRef = useMemo(() => collection(db, "games"), []);
  const nowTimestamp = useMemo(() => Timestamp.now(), []);

  // Firestore Data Hooks
  const [group, groupLoading, groupError] = useDocumentData<Group>(groupRef);
  
  // State for member data and loading
  const [rawMembers, setRawMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<Error | null>(null);
  const upcomingGamesQuery = useMemo(
    () =>
      query(
        gamesCollectionRef,
        where("groupId", "==", groupId),
        where("scheduledTime", ">=", nowTimestamp),
        orderBy("scheduledTime", "asc")
      ).withConverter(firestoreConverter<Game>()),
    [gamesCollectionRef, groupId, nowTimestamp]
  );
  const [upcomingGames, upcomingGamesLoading, upcomingGamesError] =
    useCollectionData<Game>(upcomingGamesQuery);
  const pastGamesQuery = useMemo(
    () =>
      query(
        gamesCollectionRef,
        where("groupId", "==", groupId),
        where("scheduledTime", "<", nowTimestamp),
        orderBy("scheduledTime", "desc")
      ).withConverter(firestoreConverter<Game>()),
    [gamesCollectionRef, groupId, nowTimestamp]
  );
  const [pastGames, pastGamesLoading, pastGamesError] =
    useCollectionData<Game>(pastGamesQuery);

  // State for user participation status
  const [userParticipantStatus, setUserParticipantStatus] = useState<Record<string, ParticipantStatus>>({});

  // Fetch member details whenever group changes
  useEffect(() => {
    if (group && !groupLoading) {
      setMembersLoading(true);
      const fetchMemberDetails = async () => {
        try {
          if (!group.memberIds || group.memberIds.length === 0) {
            setRawMembers([]);
            setMembersLoading(false);
            return;
          }

          // Create GroupMember objects with user details
          const memberPromises = group.memberIds.map(async (userId) => {
            try {
              const userRef = doc(db, "users", userId);
              const userSnap = await getDoc(userRef);
              
              // Create the GroupMember object
              const member: GroupMember = {
                userId,
                // Assign role based on whether the user is in adminIds
                role: group.adminIds?.includes(userId) ? "admin" : "member",
                user: {}
              };

              // If user document exists, add user details
              if (userSnap.exists()) {
                const userData = userSnap.data();
                member.user = {
                  name: userData.displayName || userData.name || "Unknown User",
                  email: userData.email || "",
                  photoURL: userData.photoURL || undefined
                };
              } else {
                member.user = {
                  name: "Unknown User",
                  email: "",
                  photoURL: undefined
                };
              }

              return member;
            } catch (err) {
              console.error(`Error fetching user ${userId} details:`, err);
              // Return a minimal member object if there's an error
              return {
                userId,
                role: group.adminIds?.includes(userId) ? "admin" : "member",
                user: { name: "Unknown User", email: "", photoURL: undefined }
              };
            }
          });

          const members = await Promise.all(memberPromises);
          setRawMembers(members);
        } catch (err) {
          console.error("Error fetching member details:", err);
          setMembersError(err instanceof Error ? err : new Error("Unknown error fetching members"));
        } finally {
          setMembersLoading(false);
        }
      };

      fetchMemberDetails();
    }
  }, [group, groupLoading, db]);

  // Add effect to fetch participant status for all games
  useEffect(() => {
    const fetchParticipantStatus = async () => {
      if (!currentUser || !upcomingGames?.length) return;

      try {
        const statuses: Record<string, ParticipantStatus> = {};
        
        for (const game of upcomingGames) {
          const response = await fetch(`/api/games/${game.id}/participants`, {
            headers: {
              'Authorization': `Bearer ${await currentUser.getIdToken()}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const userParticipant = data.participants.find(
              (p: any) => p.userId === currentUser.uid
            );
            if (userParticipant) {
              statuses[game.id] = userParticipant.status;
            }
          }
        }

        setUserParticipantStatus(statuses);
      } catch (error) {
        console.error('Error fetching participant status:', error);
      }
    };

    fetchParticipantStatus();
  }, [currentUser, upcomingGames]);

  // Memoized Values
  const members = useMemo(() => rawMembers, [rawMembers]);
  const canManage = useMemo(
    () =>
      currentUser &&
      group &&
      (group.adminIds?.includes(currentUser.uid) ||
        group.createdBy === currentUser.uid),
    [currentUser, group]
  );
  const enhancedUpcomingGames = useMemo(
    () =>
      upcomingGames?.map((game) => ({
        ...game,
        isAdmin: canManage ?? false,
      })) ?? [],
    [upcomingGames, canManage]
  );
  const enhancedPastGames = useMemo(
    () =>
      pastGames?.map((game) => ({ ...game, isAdmin: canManage ?? false })) ??
      [],
    [pastGames, canManage]
  );

  // Handlers
  const handleEditGroup = useCallback(() => {
    if (group) {
      router.push(`/app/groups/edit/${groupId}`);
    }
  }, [router, groupId, group]);

  const handleCreateGameClick = useCallback(() => {
    setShowCreateGameForm(true);
  }, []);

  const handleCloseCreateGameForm = useCallback(() => {
    setShowCreateGameForm(false);
  }, []);

  // Add handlers for joining and leaving games
  const handleJoinGame = async (game: Game) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/games/${game.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      // The game list will automatically update through the Firestore subscription
    } catch (error) {
      console.error('Error joining game:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleLeaveGame = async (game: Game) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/games/${game.id}/participants?participantId=${currentUser.uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave game');
      }

      // The game list will automatically update through the Firestore subscription
    } catch (error) {
      console.error('Error leaving game:', error);
      // You might want to show an error message to the user here
    }
  };

  // Loading and Error States
  const overallLoading =
    groupLoading || membersLoading || upcomingGamesLoading || pastGamesLoading;
  const overallError =
    groupError || membersError || upcomingGamesError || pastGamesError;

  if (overallLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (overallError || !group) {
    const errorMessage = 'Group not found or an error occurred.';
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{errorMessage}</p>
        </div>
        <button
          onClick={() => router.push("/app/groups")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Groups Link */}
      <Link
        href="/app/groups"
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
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

      {/* Group Header */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
        <div className="relative h-56 bg-gradient-to-r from-blue-500 to-indigo-600">
          {group.photoURL ? (
            <Image
              src={group.photoURL}
              alt={group.name}
              fill
              className="object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl font-bold text-white opacity-50">
                {group.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30 p-6 flex flex-col justify-end">
            <h1 className="text-3xl font-bold text-white mb-1">{group.name}</h1>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-xs font-semibold bg-white text-blue-700 rounded-full shadow">
                {group.sport}
              </span>
              <span
                className={`px-3 py-1 text-xs font-semibold text-white rounded-full shadow ${
                  group.isPublic ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {group.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </div>
        {group.description && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Description
            </h2>
            <p className="text-gray-700">{group.description}</p>
          </div>
        )}
        {canManage && (
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={handleCreateGameClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Game
            </button>
          </div>
        )}
      </div>

      {/* Modal for Create Game Form */}
      {showCreateGameForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900">
                Create New Game
              </h3>
              <button
                onClick={handleCloseCreateGameForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              </button>
            </div>
            <div className="mt-2">
              <ModernGameForm
                initialData={{ groupId }}
                onSubmit={async (formData) => {
                  try {
                    const response = await fetch("/api/games/create", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await currentUser?.getIdToken()}`,
                      },
                      body: JSON.stringify(formData),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || "Failed to create game");
                    }

                    const result = await response.json();
                  handleCloseCreateGameForm();
                    
                    // Optionally refresh the games list here if needed
                    // You can add a refreshGames() function if needed
                  } catch (error) {
                    console.error("Error creating game:", error);
                    // Handle error appropriately
                  }
                }}
                onCancel={handleCloseCreateGameForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-300">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {["games", "members", "settings"].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName as any)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${
                  activeTab === tabName
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                ${tabName === "settings" && !canManage ? "hidden" : ""} `}
            >
              {tabName}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "games" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Upcoming Games
              </h2>
              <GameList
                games={enhancedUpcomingGames}
                isLoading={upcomingGamesLoading}
                emptyMessage="No upcoming games scheduled for this group."
                isAdmin={canManage ?? false}
                onJoinGame={handleJoinGame}
                onLeaveGame={handleLeaveGame}
                userParticipantStatus={userParticipantStatus}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Past Games
              </h2>
              <GameList
                games={enhancedPastGames}
                isLoading={pastGamesLoading}
                emptyMessage="No past games found for this group."
                isAdmin={canManage ?? false}
                onJoinGame={handleJoinGame}
                onLeaveGame={handleLeaveGame}
                userParticipantStatus={userParticipantStatus}
              />
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Group Members ({members.length})
            </h2>
            {membersLoading && <p>Loading members...</p>}
            {membersError && (
              <p className="text-red-500">
                Error loading members
              </p>
            )}
            {members.length > 0 && group && (
              <MembersList
                group={group}
                members={members}
                isAdmin={canManage ?? false}
                onMemberInvited={() => console.log("Invite member action")}
                onRoleChange={(memberId, role) =>
                  console.log(`Change role for ${memberId} to ${role}`)
                }
                onRemoveMember={(memberId) =>
                  console.log(`Remove member ${memberId}`)
                }
              />
            )}
            {members.length === 0 && !membersLoading && (
              <p>No members found in this group yet.</p>
            )}
          </div>
        )}

        {activeTab === "settings" && canManage && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Group Settings
            </h2>
            <p className="text-gray-600 mb-4">
              Manage your group details, privacy, and other settings here.
            </p>
            <button
              onClick={handleEditGroup}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Group Details
            </button>
            {/* More settings options can be added here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
