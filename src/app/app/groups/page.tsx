"use client";

import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { Group, SportType, Game } from "@/lib/types/models"; // Added Game
import GroupList from "@/components/groups/GroupList";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestoreConverter } from "@/lib/firebase/converters"; // Import the converter

// Define a type for group with last game
export type GroupWithLastGame = Group & { lastGame?: Game | null };

export default function GroupsPage() {
  const router = useRouter();
  const { currentUser, isLoadingAuth } = useAuth();
  const db = useMemo(() => getFirestore(), []); // Memoize db instance

  // Fetch user's groups
  const groupsCollectionRef = useMemo(() => {
    // db is memoized, so it's stable. This ref will be created once db is available.
    return collection(db, "groups").withConverter(firestoreConverter<Group>());
  }, [db]);

  const groupsQuery = useMemo(() => {
    if (!currentUser || !groupsCollectionRef) return null;
    // Depend on currentUser.uid for stability if the currentUser object reference changes frequently
    try {
      // Create the query in a single call
      return query(
        groupsCollectionRef,
        where("memberIds", "array-contains", currentUser.uid)
      );
    } catch (error) {
      console.error("Error creating groups query:", error);
      return null;
    }
  }, [groupsCollectionRef, currentUser]); // Include currentUser to satisfy the exhaustive-deps rule

  // No longer need idField with the converter, as it handles adding the id.
  const [baseGroups, loadingBaseGroups, errorBaseGroups] =
    useCollectionData<Group>(groupsQuery);

  // Memoize the games collection reference, similar to groupsCollectionRef
  const gamesCollectionRefForLastGame = useMemo(() => {
    if (!db) return null; // Ensure db is initialized
    try {
      return collection(db, "games").withConverter(firestoreConverter<Game>());
    } catch (error) {
      console.error("Error creating games collection reference:", error);
      return null;
    }
  }, [db]);

  const [groupsWithDetails, setGroupsWithDetails] = useState<
    GroupWithLastGame[]
  >([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    // Ensure gamesCollectionRefForLastGame is available before proceeding
    if (baseGroups && baseGroups.length > 0 && gamesCollectionRefForLastGame) {
      setLoadingDetails(true);
      const fetchLastGames = async () => {
        const enhancedGroups = await Promise.all(
          baseGroups.map(async (group: Group) => {
            console.log(
              "Processing group in map:",
              JSON.stringify(group, null, 2),
            ); // DEBUG LOG
            // More robust check for group.id
            if (
              !group.id ||
              typeof group.id !== "string" ||
              group.id.trim() === ""
            ) {
              console.error(
                "Invalid group.id for fetching last game. Group ID:",
                group.id,
                "Group:",
                JSON.stringify(group, null, 2),
              );
              return { ...group, lastGame: null }; // Skip query if id is invalid
            }
            try {
              // --- Start Added Debug Logs ---
              console.log(
                `Querying games for group.id: '${group.id}', type: ${typeof group.id}`,
              );
              console.log("Firestore instance (db):", db);
              console.log(
                "Games collection (gamesCollectionRefForLastGame):",
                gamesCollectionRefForLastGame,
              );
              // --- End Added Debug Logs ---

              // Ensure we have a valid collection reference before creating the query
              if (!gamesCollectionRefForLastGame) {
                console.error(
                  "Games collection reference is null or undefined",
                );
                return { ...group, lastGame: null };
              }

              // Ensure group.id is a valid string before using it in the query
              if (typeof group.id !== "string" || !group.id.trim()) {
                console.error("Invalid group ID for query:", group.id);
                return { ...group, lastGame: null };
              }

              // Wrap query creation in its own try-catch for more specific error handling
              let gameQuery;
              try {
                // Build the query in a single call with all constraints
                gameQuery = query(
                  gamesCollectionRefForLastGame,
                  where("groupId", "==", group.id),
                  orderBy("scheduledTime", "desc"),
                  limit(1)
                );
              } catch (queryError) {
                console.error(
                  `Error creating query for group ${group.id}:`,
                  queryError,
                );
                return { ...group, lastGame: null };
              }
              // Wrap getDocs in its own try-catch for more specific error handling
              let gameSnapshot;
              try {
                gameSnapshot = await getDocs(gameQuery);
              } catch (getDocsError) {
                console.error(
                  `Error executing query for group ${group.id}:`,
                  getDocsError,
                );
                return { ...group, lastGame: null };
              }

              let lastGame: Game | null = null;
              if (gameSnapshot && !gameSnapshot.empty) {
                try {
                  // gameData will be of type Game due to the converter.
                  // The converter should also handle adding the 'id' to the object.
                  const gameData = gameSnapshot.docs[0].data();

                  // Ensure gameData is valid before processing
                  if (!gameData) {
                    console.error(
                      `No data found in game document for group ${group.id}`,
                    );
                    return { ...group, lastGame: null };
                  }

                  lastGame = {
                    ...gameData,
                    // Process Timestamp fields safely with additional error handling
                    scheduledTime:
                      gameData.scheduledTime instanceof Timestamp
                        ? gameData.scheduledTime.toDate().toISOString()
                        : gameData.scheduledTime,
                    createdAt:
                      gameData.createdAt instanceof Timestamp
                        ? gameData.createdAt.toDate().toISOString()
                        : gameData.createdAt,
                    updatedAt:
                      gameData.updatedAt instanceof Timestamp
                        ? gameData.updatedAt.toDate().toISOString()
                        : gameData.updatedAt,
                    endTime:
                      gameData.endTime &&
                      (gameData.endTime instanceof Timestamp
                        ? gameData.endTime.toDate().toISOString()
                        : gameData.endTime),
                  };
                } catch (dataProcessingError) {
                  console.error(
                    `Error processing game data for group ${group.id}:`,
                    dataProcessingError,
                  );
                  return { ...group, lastGame: null };
                }
              }
              return { ...group, lastGame };
            } catch (err) {
              // Use group.id safely in the error message, knowing it was validated
              console.error(
                `Failed to fetch last game for group ${group.id || "UNKNOWN_ID"}:`,
                err,
              );
              return { ...group, lastGame: null }; // Handle error for individual group
            }
          }),
        );
        console.log(
          "Enhanced groups:",
          JSON.stringify(enhancedGroups, null, 2),
        ); // DEBUG LOG
        enhancedGroups.forEach((eg) => {
          if (!eg.id) {
            console.error(
              "Enhanced group is missing ID:",
              JSON.stringify(eg, null, 2),
            );
          }
        });
        setGroupsWithDetails(enhancedGroups);
        setLoadingDetails(false);
      };
      fetchLastGames();
    } else if (baseGroups && gamesCollectionRefForLastGame) {
      // Also check gamesCollectionRefForLastGame here
      console.log(
        "Base groups loaded but empty, or games collection ref not ready.",
      ); // DEBUG LOG
      setGroupsWithDetails([]);
      setLoadingDetails(false);
    }
  }, [baseGroups, db, gamesCollectionRefForLastGame]); // Add gamesCollectionRefForLastGame to dependencies

  const handleCreateGroup = () => {
    router.push("/app/groups/create");
  };

  const isLoading = isLoadingAuth || loadingBaseGroups || loadingDetails;
  const error = errorBaseGroups
    ? "Failed to load groups. Please try again later."
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Create Group
        </button>
      </div>

      {/* Filters removed as per plan */}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : groupsWithDetails.length === 0 && !isLoading ? ( // Check isLoading to avoid flash of "no groups"
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You are not a member of any groups yet, or no groups found.
          </p>
          <button
            onClick={handleCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <GroupList
          groups={groupsWithDetails}
          // userRole, onEditGroup, onDeleteGroup props removed as they are not in GroupListProps anymore
        />
      )}
    </div>
  );
}
