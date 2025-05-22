import { db } from "@/lib/firebase/firebaseClient";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  Timestamp,
  FieldValue,
  addDoc,
} from "firebase/firestore";
import {
  Game,
  GameParticipant,
  GameStatus,
  ParticipantStatus,
} from "@/lib/types/models";

/**
 * Get upcoming games for a user
 *
 * @param userId - The ID of the user
 * @returns A promise that resolves to an array of upcoming games
 */
export async function getUserUpcomingGames(userId: string): Promise<Game[]> {
  if (!userId) {
    console.warn("getUserUpcomingGames called with no userId");
    return [];
  }

  try {
    // Get games directly where the user is in participantIds
    const gamesQuery = query(
      collection(db, "games"),
      where("participantIds", "array-contains", userId),
      where("status", "==", GameStatus.UPCOMING),
      orderBy("scheduledTime", "asc")
    );

    const gameDocs = await getDocs(gamesQuery);
    if (gameDocs.empty) {
      console.log("No games found for user:", userId);
      return [];
    }

    const games = gameDocs.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        scheduledTime: data.scheduledTime,
        endTime: data.endTime,
        participantIds: data.participantIds || [],
        waitlistIds: data.waitlistIds || [],
        isRecurring: data.isRecurring || false,
        isPrivate: data.isPrivate || false
      } as Game;
    });

    // Filter out games that are in the past
    const now = Timestamp.now();
    return games.filter(game => game.scheduledTime.toMillis() > now.toMillis());

  } catch (error) {
    console.error("Error getting user upcoming games:", error);
    return [];
  }
}

/**
 * Create a new game
 *
 * @param gameData - The game data to create
 * @param userId - The ID of the user creating the game
 * @returns A promise that resolves to the created game
 */
export async function createGame(
  gameData: Omit<Game, "id" | "createdAt" | "updatedAt" | "currentParticipants" | "participantIds" | "waitlistIds" | "status">
): Promise<Game> {
  try {
    const now = Timestamp.now();

    // Create the game document with empty participants
    const newGameData = {
      ...gameData,
      createdAt: now,
      updatedAt: now,
      currentParticipants: 0,
      participantIds: [],
      waitlistIds: [],
      status: GameStatus.UPCOMING,
    };

    // Add the game document
    const gameRef = await addDoc(collection(db, "games"), newGameData);
    const newGame = { ...newGameData, id: gameRef.id } as Game;

    return newGame;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
}

/**
 * Helper function to convert Firestore timestamp to Date
 */
function convertToDate(timestamp: Timestamp | Date | FieldValue | string | undefined): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (typeof timestamp === 'string') return new Date(timestamp);
  return undefined;
}

/**
 * Get a game by ID
 *
 * @param gameId - The ID of the game to get
 * @returns A promise that resolves to the game or null if not found
 */
export async function getGame(gameId: string): Promise<Game | null> {
  if (!gameId) {
    console.warn("getGame called with no gameId");
    return null;
  }

  try {
    const gameDoc = await getDoc(doc(db, "games", gameId));

    if (!gameDoc.exists()) {
      return null;
    }

    const data = gameDoc.data();
    return {
      ...data,
      id: gameDoc.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      scheduledTime: data.scheduledTime,
      endTime: data.endTime,
      participantIds: data.participantIds || [],
      waitlistIds: data.waitlistIds || [],
      isRecurring: data.isRecurring || false,
      isPrivate: data.isPrivate || false,
      currentParticipants: data.currentParticipants || 0
    } as Game;
  } catch (error) {
    console.error("Error getting game:", error);
    return null;
  }
}

/**
 * Update a game
 *
 * @param gameId - The ID of the game to update
 * @param gameData - The game data to update
 * @returns A promise that resolves when the game is updated
 */
export async function updateGame(
  gameId: string,
  gameData: Partial<Omit<Game, "id" | "createdBy" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "games", gameId), gameData);
  } catch (error) {
    console.error("Error updating game:", error);
    throw new Error("Failed to update game");
  }
}

/**
 * Delete a game
 *
 * @param gameId - The ID of the game to delete
 * @returns A promise that resolves when the game is deleted
 */
export async function deleteGame(gameId: string): Promise<void> {
  try {
    // Delete the game document
    await deleteDoc(doc(db, "games", gameId));

    // In a production app, you would also:
    // 1. Delete all game participants
    // This would typically be handled by a Cloud Function
  } catch (error) {
    console.error("Error deleting game:", error);
    throw new Error("Failed to delete game");
  }
}

/**
 * Get games for a group
 *
 * @param groupId - The ID of the group to get games for
 * @returns A promise that resolves to an array of games
 */
export async function getGroupGames(groupId: string): Promise<Game[]> {
  if (!groupId) {
    console.warn("getGroupGames called with no groupId");
    return [];
  }

  try {
    // First get the group to get its name
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    const groupName = groupDoc.exists() ? groupDoc.data().name : undefined;

    const gamesQuery = query(
      collection(db, "games"),
      where("groupId", "==", groupId),
      where("status", "==", GameStatus.UPCOMING),
      orderBy("scheduledTime", "asc"),
    );

    const gameDocs = await getDocs(gamesQuery);
    if (gameDocs.empty) {
      return [];
    }

    const games = gameDocs.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        scheduledTime: data.scheduledTime,
        endTime: data.endTime,
        participantIds: data.participantIds || [],
        waitlistIds: data.waitlistIds || [],
        isRecurring: data.isRecurring || false,
        isPrivate: data.isPrivate || false,
        groupName, // Add the group name to each game
      } as Game;
    });

    // Filter out games that are in the past
    const now = Timestamp.now();
    return games.filter(game => game.scheduledTime.toMillis() > now.toMillis());
  } catch (error) {
    console.error("Error getting group games:", error);
    return [];
  }
}

/**
 * Get participants for a game
 *
 * @param gameId - The ID of the game to get participants for
 * @returns A promise that resolves to an array of game participants
 */
export async function getGameParticipants(
  gameId: string,
): Promise<GameParticipant[]> {
  if (!gameId) {
    console.warn("getGameParticipants called with no gameId");
    return [];
  }

  try {
    const participantsQuery = query(
      collection(db, "gameParticipants"),
      where("gameId", "==", gameId),
    );

    const participantDocs = await getDocs(participantsQuery);

    if (participantDocs.empty) {
      return [];
    }

    return participantDocs.docs.map((doc) => doc.data() as GameParticipant);
  } catch (error) {
    console.error("Error getting game participants:", error);
    return [];
  }
}

/**
 * Add a participant to a game
 *
 * @param gameId - The ID of the game to add the participant to
 * @param userId - The ID of the user to add
 * @param status - The status of the participant
 * @returns A promise that resolves to the created game participant
 */
export async function addGameParticipant(
  gameId: string,
  userId: string,
  status: ParticipantStatus = ParticipantStatus.CONFIRMED,
  displayName?: string,
  photoURL?: string
): Promise<GameParticipant> {
  try {
    // Check if the user is already a participant
    const participantDoc = await getDoc(
      doc(db, "gameParticipants", `${gameId}_${userId}`),
    );

    if (participantDoc.exists()) {
      throw new Error("User is already a participant in this game");
    }

    const now = Timestamp.now();

    // Create the game participant in both locations
    const gameParticipant: GameParticipant = {
      id: `${gameId}_${userId}`,
      gameId,
      userId,
      status,
      joinedAt: now,
      registeredAt: now,
      role: 'player',
      isGuest: false,
      displayName,
      photoURL
    };

    // 1. Add to gameParticipants collection for global queries
    await setDoc(
      doc(db, "gameParticipants", gameParticipant.id),
      gameParticipant,
    );

    // 2. Add to game's participants subcollection
    await setDoc(
      doc(collection(db, "games", gameId, "participants"), userId),
      {
        userId,
        status,
        joinedAt: now,
        registeredAt: now,
        role: 'player',
        isGuest: false,
        displayName,
        photoURL
      } as GameParticipant
    );

    // 3. Update the game document
    const gameDoc = await getDoc(doc(db, "games", gameId));
    if (gameDoc.exists()) {
      const game = gameDoc.data() as Game;
      const updates: Partial<Game> = {};

      if (status === ParticipantStatus.CONFIRMED) {
        updates.currentParticipants = (game.currentParticipants || 0) + 1;
        updates.participantIds = [...(game.participantIds || []), userId];
      } else if (status === ParticipantStatus.WAITLIST) {
        updates.waitlistIds = [...(game.waitlistIds || []), userId];
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "games", gameId), updates);
      }
    }

    return gameParticipant;
  } catch (error) {
    console.error("Error adding game participant:", error);
    throw new Error("Failed to add game participant");
  }
}

/**
 * Update a game participant's status
 *
 * @param gameId - The ID of the game
 * @param userId - The ID of the user
 * @param status - The new status for the user
 * @returns A promise that resolves when the status is updated
 */
export async function updateGameParticipantStatus(
  gameId: string,
  userId: string,
  status: ParticipantStatus,
): Promise<void> {
  try {
    const participantId = `${gameId}_${userId}`;
    const participantDoc = await getDoc(
      doc(db, "gameParticipants", participantId),
    );

    if (!participantDoc.exists()) {
      throw new Error("Participant not found");
    }

    const participant = participantDoc.data() as GameParticipant;
    const oldStatus = participant.status;

    await updateDoc(doc(db, "gameParticipants", participantId), { status });

    // Update the participant count in the game if status changed between confirmed and waitlist
    if (oldStatus !== status) {
      const gameDoc = await getDoc(doc(db, "games", gameId));

      if (gameDoc.exists()) {
        const game = gameDoc.data() as Game;

        if (
          oldStatus === ParticipantStatus.WAITLIST &&
          status === ParticipantStatus.CONFIRMED
        ) {
          // Moving from waitlist to confirmed, increment count
          await updateDoc(doc(db, "games", gameId), {
            currentParticipants: (game.currentParticipants || 0) + 1,
          });
        } else if (
          oldStatus === ParticipantStatus.CONFIRMED &&
          status === ParticipantStatus.WAITLIST
        ) {
          // Moving from confirmed to waitlist, decrement count
          await updateDoc(doc(db, "games", gameId), {
            currentParticipants: Math.max(
              (game.currentParticipants || 0) - 1,
              0,
            ),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error updating game participant status:", error);
    throw new Error("Failed to update game participant status");
  }
}

/**
 * Remove a participant from a game
 *
 * @param gameId - The ID of the game
 * @param userId - The ID of the user to remove
 * @returns A promise that resolves when the participant is removed
 */
export async function removeGameParticipant(
  gameId: string,
  userId: string,
): Promise<void> {
  try {
    const participantId = `${gameId}_${userId}`;
    const participantDoc = await getDoc(
      doc(db, "gameParticipants", participantId),
    );

    if (!participantDoc.exists()) {
      throw new Error("Participant not found");
    }

    const participant = participantDoc.data() as GameParticipant;

    // Delete the game participant
    await deleteDoc(doc(db, "gameParticipants", participantId));

    // Update the participant count in the game if the participant was confirmed
    if (participant.status === ParticipantStatus.CONFIRMED) {
      const gameDoc = await getDoc(doc(db, "games", gameId));

      if (gameDoc.exists()) {
        const game = gameDoc.data() as Game;
        await updateDoc(doc(db, "games", gameId), {
          currentParticipants: Math.max((game.currentParticipants || 0) - 1, 0),
        });
      }
    }
  } catch (error) {
    console.error("Error removing game participant:", error);
    throw new Error("Failed to remove game participant");
  }
}
