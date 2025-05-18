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
    // First, get all game participants for this user
    const participantsQuery = query(
      collection(db, "gameParticipants"),
      where("userId", "==", userId),
    );

    const participantDocs = await getDocs(participantsQuery);

    if (participantDocs.empty) {
      return [];
    }

    // Extract game IDs from participants
    const gameIds = participantDocs.docs.map((doc) => {
      const participant = doc.data() as GameParticipant;
      return participant.gameId;
    });

    // Get unique game IDs
    const uniqueGameIds = Array.from(new Set(gameIds));

    // Get all games
    const games: Game[] = [];

    // Fetch games in batches to avoid potential issues with large IN queries
    const batchSize = 10;
    for (let i = 0; i < uniqueGameIds.length; i += batchSize) {
      const batch = uniqueGameIds.slice(i, i + batchSize);

      // For each batch, get games that are upcoming (date is in the future)
      for (const gameId of batch) {
        const gameDoc = await getDoc(doc(db, "games", gameId));

        if (gameDoc.exists()) {
          const game = gameDoc.data() as Game;

          // Check if the game is upcoming
          const gameDate =
            game.date instanceof Timestamp
              ? game.date.toDate()
              : new Date(game.date);
          const now = new Date();

          if (gameDate > now || game.status === GameStatus.UPCOMING) {
            games.push(game);
          }
        }
      }
    }

    // Sort games by date
    return games.sort((a, b) => {
      const dateA =
        a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
      const dateB =
        b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
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
  gameData: Omit<
    Game,
    "id" | "createdBy" | "createdAt" | "currentParticipants" | "status"
  >,
  userId: string,
): Promise<Game> {
  try {
    // Create a new document reference with auto-generated ID
    const gameRef = doc(collection(db, "games"));

    // Prepare the game data
    const newGame: Game = {
      id: gameRef.id,
      ...gameData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      currentParticipants: 0,
      status: GameStatus.UPCOMING,
    };

    // Create the game document
    await setDoc(gameRef, newGame);

    return {
      ...newGame,
      createdAt: Timestamp.now(), // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error creating game:", error);
    throw new Error("Failed to create game");
  }
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

    return gameDoc.data() as Game;
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
    const gamesQuery = query(
      collection(db, "games"),
      where("groupId", "==", groupId),
      orderBy("date", "asc"),
    );

    const gameDocs = await getDocs(gamesQuery);

    if (gameDocs.empty) {
      return [];
    }

    return gameDocs.docs.map((doc) => doc.data() as Game);
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
): Promise<GameParticipant> {
  try {
    // Check if the user is already a participant
    const participantDoc = await getDoc(
      doc(db, "gameParticipants", `${gameId}_${userId}`),
    );

    if (participantDoc.exists()) {
      throw new Error("User is already a participant in this game");
    }

    // Create the game participant
    const gameParticipant: GameParticipant = {
      id: `${gameId}_${userId}`,
      gameId,
      userId,
      status,
      isGuest: false,
      registeredAt: serverTimestamp(),
    };

    await setDoc(
      doc(db, "gameParticipants", gameParticipant.id),
      gameParticipant,
    );

    // Update the participant count in the game
    const gameDoc = await getDoc(doc(db, "games", gameId));

    if (gameDoc.exists()) {
      const game = gameDoc.data() as Game;

      if (status === ParticipantStatus.CONFIRMED) {
        await updateDoc(doc(db, "games", gameId), {
          currentParticipants: (game.currentParticipants || 0) + 1,
        });
      }
    }

    return {
      ...gameParticipant,
      registeredAt: Timestamp.now(), // Replace serverTimestamp with actual Timestamp for return value
    };
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
