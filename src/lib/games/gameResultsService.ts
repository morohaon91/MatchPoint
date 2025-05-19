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
  Timestamp
} from "firebase/firestore";
import { GameResult } from "@/lib/types/models";

/**
 * Record a game result
 * 
 * @param gameId - The ID of the game
 * @param resultData - The game result data
 * @param userId - The ID of the user recording the result
 * @returns A promise that resolves to the recorded game result
 */
export async function recordGameResult(
  gameId: string,
  resultData: Omit<GameResult, 'gameId' | 'recordedBy' | 'recordedAt'>,
  userId: string
): Promise<GameResult> {
  try {
    // Create a new game result document
    const gameResultRef = doc(db, "gameResults", gameId);
    
    // Prepare the game result data
    const gameResult: GameResult = {
      gameId,
      ...resultData,
      recordedBy: userId,
      recordedAt: serverTimestamp()
    };
    
    // Save the game result
    await setDoc(gameResultRef, gameResult);
    
    return {
      ...gameResult,
      recordedAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error recording game result:", error);
    throw new Error("Failed to record game result");
  }
}

/**
 * Get a game result
 * 
 * @param gameId - The ID of the game
 * @returns A promise that resolves to the game result or null if not found
 */
export async function getGameResult(gameId: string): Promise<GameResult | null> {
  try {
    const gameResultDoc = await getDoc(doc(db, "gameResults", gameId));
    
    if (!gameResultDoc.exists()) {
      return null;
    }
    
    return gameResultDoc.data() as GameResult;
  } catch (error) {
    console.error("Error getting game result:", error);
    throw new Error("Failed to get game result");
  }
}

/**
 * Update a game result
 * 
 * @param gameId - The ID of the game
 * @param resultData - The game result data to update
 * @returns A promise that resolves when the game result is updated
 */
export async function updateGameResult(
  gameId: string,
  resultData: Partial<Omit<GameResult, 'gameId' | 'recordedBy' | 'recordedAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, "gameResults", gameId), resultData);
  } catch (error) {
    console.error("Error updating game result:", error);
    throw new Error("Failed to update game result");
  }
}

/**
 * Delete a game result
 * 
 * @param gameId - The ID of the game
 * @returns A promise that resolves when the game result is deleted
 */
export async function deleteGameResult(gameId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "gameResults", gameId));
  } catch (error) {
    console.error("Error deleting game result:", error);
    throw new Error("Failed to delete game result");
  }
}

/**
 * Get game results for a group
 * 
 * @param groupId - The ID of the group
 * @param maxResults - Maximum number of results to return
 * @returns A promise that resolves to an array of game results
 */
export async function getGroupGameResults(
  groupId: string,
  maxResults: number = 20
): Promise<GameResult[]> {
  try {
    // First, get the games for this group
    const gamesQuery = query(
      collection(db, "games"),
      where("groupId", "==", groupId),
      orderBy("date", "desc"),
      limit(50) // Get more games than we need to filter for ones with results
    );
    
    const gameDocs = await getDocs(gamesQuery);
    const gameIds = gameDocs.docs.map(doc => doc.id);
    
    // Now, get the game results for these games
    const gameResults: GameResult[] = [];
    
    for (const gameId of gameIds) {
      const gameResult = await getGameResult(gameId);
      
      if (gameResult) {
        gameResults.push(gameResult);
        
        // If we have enough results, stop
        if (gameResults.length >= maxResults) {
          break;
        }
      }
    }
    
    return gameResults;
  } catch (error) {
    console.error("Error getting group game results:", error);
    throw new Error("Failed to get group game results");
  }
}

/**
 * Get player statistics for a group
 * 
 * @param groupId - The ID of the group
 * @param userId - The ID of the user to get statistics for
 * @returns A promise that resolves to the player statistics
 */
export async function getPlayerStatistics(
  groupId: string,
  userId: string
): Promise<{
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
}> {
  try {
    // Get all game results for this group
    const gameResults = await getGroupGameResults(groupId, 100);
    
    // Filter for games the player participated in
    const playerGames = gameResults.filter(result => 
      result.attendees.includes(userId)
    );
    
    // Count games won
    const gamesWon = playerGames.filter(result => {
      // If there's a winner team ID
      if (result.winner) {
        // Check if the player was on the winning team
        // We need to look up the team assignments for this game
        // This is a simplification - in a real implementation, we would need to
        // fetch the team assignments for each game
        return true; // Placeholder
      }
      return false;
    }).length;
    
    return {
      gamesPlayed: playerGames.length,
      gamesWon,
      winPercentage: playerGames.length > 0 ? (gamesWon / playerGames.length) * 100 : 0
    };
  } catch (error) {
    console.error("Error getting player statistics:", error);
    throw new Error("Failed to get player statistics");
  }
}
