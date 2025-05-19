"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  CSSProperties,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { Group, GroupMember, Game } from "@/lib/types/models";
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
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { firestoreConverter } from "@/lib/firebase/converters";

const GroupDetailsPage: React.FC = () => {
  const { id: groupId } = useParams();
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
  const membersRef = useMemo(
    () =>
      collection(db, "groups", groupId, "members").withConverter(
        firestoreConverter<GroupMember>()
      ),
    [groupId]
  );
  const gamesCollectionRef = useMemo(() => collection(db, "games"), []);
  const nowTimestamp = useMemo(() => Timestamp.now(), []);

  // Firestore Data Hooks
  const [group, groupLoading, groupError] = useDocumentData<Group>(groupRef);
  const [rawMembers, membersLoading, membersError] =
    useCollectionData<GroupMember>(membersRef);
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

  // Memoized Values
  const members = useMemo(() => rawMembers ?? [], [rawMembers]);
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>
            {overallError?.message || "Group not found or an error occurred."}
          </p>
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
                onSubmit={async () => {
                  handleCloseCreateGameForm();
                  router.push(`/app/games/create?groupId=${groupId}`);
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
                Error loading members: {membersError.message}
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
