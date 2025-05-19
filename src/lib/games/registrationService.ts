import { db } from "@/lib/firebase/firebaseClient";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { Game, GameParticipant, ParticipantStatus } from "@/lib/types/models";
import { getGameParticipants, updateGameParticipantStatus } from "./gameService";

/**
 * Calculate priority score for a user based on their participation history
 * 
 * @param userId - The ID of the user
 * @param groupId - The ID of the group
 * @returns A promise that resolves to the priority score
 */
export async function calculatePriorityScore(
  userId: string,
  groupId: string
): Promise<number> {
  try {
    // Get the user's participation history for this group
    const gamesQuery = query(
      collection(db, "games"),
      where("groupId", "==", groupId),
      where("date", "<", Timestamp.now()),
      orderBy("date", "desc"),
      limit(10) // Consider the last 10 games
    );
    
    const gameDocs = await getDocs(gamesQuery);
    const gameIds = gameDocs.docs.map(doc => doc.id);
    
    // Initialize score components
    let attendanceRate = 0;
    let regularityScore = 0;
    let waitlistHistory = 0;
    
    // If there are no past games, return a default score
    if (gameIds.length === 0) {
      return 50; // Default middle score
    }
    
    // Get the user's participation for these games
    let participatedGames = 0;
    let waitlistedGames = 0;
    let consecutiveAttendance = 0;
    let maxConsecutiveAttendance = 0;
    
    for (const gameId of gameIds) {
      const participantsQuery = query(
        collection(db, "gameParticipants"),
        where("gameId", "==", gameId),
        where("userId", "==", userId)
      );
      
      const participantDocs = await getDocs(participantsQuery);
      
      if (!participantDocs.empty) {
        const participantData = participantDocs.docs[0].data() as GameParticipant;
        
        if (participantData.status === ParticipantStatus.CONFIRMED) {
          participatedGames++;
          consecutiveAttendance++;
          maxConsecutiveAttendance = Math.max(maxConsecutiveAttendance, consecutiveAttendance);
        } else if (participantData.status === ParticipantStatus.WAITLIST) {
          waitlistedGames++;
          consecutiveAttendance = 0;
        } else {
          consecutiveAttendance = 0;
        }
      } else {
        consecutiveAttendance = 0;
      }
    }
    
    // Calculate attendance rate (0-40 points)
    attendanceRate = (participatedGames / gameIds.length) * 40;
    
    // Calculate regularity score based on consecutive attendance (0-30 points)
    regularityScore = (maxConsecutiveAttendance / gameIds.length) * 30;
    
    // Calculate waitlist history (0-30 points)
    // More waitlisted games should increase priority
    waitlistHistory = (waitlistedGames / gameIds.length) * 30;
    
    // Calculate total score (0-100)
    const totalScore = attendanceRate + regularityScore + waitlistHistory;
    
    return Math.min(100, totalScore);
  } catch (error) {
    console.error("Error calculating priority score:", error);
    throw new Error("Failed to calculate priority score");
  }
}

/**
 * Process the waitlist for a game
 * 
 * @param gameId - The ID of the game
 * @returns A promise that resolves to the number of participants promoted from the waitlist
 */
export async function processWaitlist(gameId: string): Promise<number> {
  try {
    // Get the game
    const gameDoc = await getDoc(doc(db, "games", gameId));
    
    if (!gameDoc.exists()) {
      throw new Error("Game not found");
    }
    
    const game = gameDoc.data() as Game;
    
    // If the game doesn't have a maximum number of participants, there's no waitlist to process
    if (!game.maxParticipants) {
      return 0;
    }
    
    // Get the current participants
    const participants = await getGameParticipants(gameId);
    
    // Count confirmed participants
    const confirmedCount = participants.filter(
      p => p.status === ParticipantStatus.CONFIRMED
    ).length;
    
    // If the game is already full, there's nothing to do
    if (confirmedCount >= game.maxParticipants) {
      return 0;
    }
    
    // Get waitlisted participants
    const waitlistedParticipants = participants.filter(
      p => p.status === ParticipantStatus.WAITLIST
    );
    
    // If there are no waitlisted participants, there's nothing to do
    if (waitlistedParticipants.length === 0) {
      return 0;
    }
    
    // Calculate how many spots are available
    const availableSpots = game.maxParticipants - confirmedCount;
    
    // Calculate priority scores for waitlisted participants
    const participantsWithScores = await Promise.all(
      waitlistedParticipants.map(async (participant) => {
        const priorityScore = await calculatePriorityScore(participant.userId, game.groupId);
        return {
          participant,
          priorityScore
        };
      })
    );
    
    // Sort by priority score (highest first)
    participantsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Promote participants from the waitlist
    const promotedParticipants = participantsWithScores.slice(0, availableSpots);
    
    // Update participant status
    const updatePromises = promotedParticipants.map(({ participant }) => 
      updateGameParticipantStatus(gameId, participant.userId, ParticipantStatus.CONFIRMED)
    );
    
    await Promise.all(updatePromises);
    
    return promotedParticipants.length;
  } catch (error) {
    console.error("Error processing waitlist:", error);
    throw new Error("Failed to process waitlist");
  }
}

/**
 * Get a user's priority status for a game
 * 
 * @param gameId - The ID of the game
 * @param userId - The ID of the user
 * @returns A promise that resolves to the priority status
 */
export async function getUserPriorityStatus(
  gameId: string,
  userId: string
): Promise<{
  priorityScore: number;
  estimatedPosition: number;
  totalWaitlisted: number;
  chanceOfPromotion: 'high' | 'medium' | 'low';
}> {
  try {
    // Get the game
    const gameDoc = await getDoc(doc(db, "games", gameId));
    
    if (!gameDoc.exists()) {
      throw new Error("Game not found");
    }
    
    const game = gameDoc.data() as Game;
    
    // Get the current participants
    const participants = await getGameParticipants(gameId);
    
    // Get waitlisted participants
    const waitlistedParticipants = participants.filter(
      p => p.status === ParticipantStatus.WAITLIST
    );
    
    // If the user is not on the waitlist, return default values
    const userParticipant = waitlistedParticipants.find(p => p.userId === userId);
    if (!userParticipant) {
      return {
        priorityScore: 0,
        estimatedPosition: 0,
        totalWaitlisted: waitlistedParticipants.length,
        chanceOfPromotion: 'low'
      };
    }
    
    // Calculate priority scores for all waitlisted participants
    const participantsWithScores = await Promise.all(
      waitlistedParticipants.map(async (participant) => {
        const priorityScore = await calculatePriorityScore(participant.userId, game.groupId);
        return {
          participant,
          priorityScore
        };
      })
    );
    
    // Sort by priority score (highest first)
    participantsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Find the user's position in the waitlist
    const userPosition = participantsWithScores.findIndex(
      p => p.participant.userId === userId
    );
    
    // Get the user's priority score
    const userPriorityScore = participantsWithScores[userPosition].priorityScore;
    
    // Count confirmed participants
    const confirmedCount = participants.filter(
      p => p.status === ParticipantStatus.CONFIRMED
    ).length;
    
    // Calculate available spots
    const availableSpots = game.maxParticipants ? game.maxParticipants - confirmedCount : 0;
    
    // Determine chance of promotion
    let chanceOfPromotion: 'high' | 'medium' | 'low' = 'low';
    
    if (availableSpots > 0) {
      if (userPosition < availableSpots) {
        chanceOfPromotion = 'high';
      } else if (userPosition < availableSpots * 2) {
        chanceOfPromotion = 'medium';
      }
    }
    
    return {
      priorityScore: userPriorityScore,
      estimatedPosition: userPosition + 1, // 1-based position
      totalWaitlisted: waitlistedParticipants.length,
      chanceOfPromotion
    };
  } catch (error) {
    console.error("Error getting user priority status:", error);
    throw new Error("Failed to get user priority status");
  }
}
