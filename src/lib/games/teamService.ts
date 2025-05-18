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
import { TeamAssignment } from "@/lib/types/models";

/**
 * Save team assignments for a game
 * 
 * @param gameId - The ID of the game
 * @param teams - The teams to save
 * @param userId - The ID of the user saving the teams
 * @returns A promise that resolves to the saved team assignment
 */
export async function saveTeamAssignments(
  gameId: string,
  teams: Record<string, { name: string; participants: string[] }>,
  userId: string
): Promise<TeamAssignment> {
  try {
    // Create a new team assignment document
    const teamAssignmentRef = doc(db, "teamAssignments", gameId);
    
    // Prepare the team assignment data
    const teamAssignment: TeamAssignment = {
      gameId,
      teams,
      createdBy: userId,
      createdAt: serverTimestamp()
    };
    
    // Save the team assignment
    await setDoc(teamAssignmentRef, teamAssignment);
    
    return {
      ...teamAssignment,
      createdAt: Timestamp.now() // Replace serverTimestamp with actual Timestamp for return value
    };
  } catch (error) {
    console.error("Error saving team assignments:", error);
    throw new Error("Failed to save team assignments");
  }
}

/**
 * Get team assignments for a game
 * 
 * @param gameId - The ID of the game
 * @returns A promise that resolves to the team assignment or null if not found
 */
export async function getTeamAssignments(gameId: string): Promise<TeamAssignment | null> {
  try {
    const teamAssignmentDoc = await getDoc(doc(db, "teamAssignments", gameId));
    
    if (!teamAssignmentDoc.exists()) {
      return null;
    }
    
    return teamAssignmentDoc.data() as TeamAssignment;
  } catch (error) {
    console.error("Error getting team assignments:", error);
    throw new Error("Failed to get team assignments");
  }
}

/**
 * Update team assignments for a game
 * 
 * @param gameId - The ID of the game
 * @param teams - The teams to update
 * @returns A promise that resolves when the team assignments are updated
 */
export async function updateTeamAssignments(
  gameId: string,
  teams: Record<string, { name: string; participants: string[] }>
): Promise<void> {
  try {
    await updateDoc(doc(db, "teamAssignments", gameId), { teams });
  } catch (error) {
    console.error("Error updating team assignments:", error);
    throw new Error("Failed to update team assignments");
  }
}

/**
 * Delete team assignments for a game
 * 
 * @param gameId - The ID of the game
 * @returns A promise that resolves when the team assignments are deleted
 */
export async function deleteTeamAssignments(gameId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "teamAssignments", gameId));
  } catch (error) {
    console.error("Error deleting team assignments:", error);
    throw new Error("Failed to delete team assignments");
  }
}

/**
 * Get team assignment history for a group
 * 
 * @param groupId - The ID of the group
 * @param maxResults - Maximum number of results to return
 * @returns A promise that resolves to an array of team assignments
 */
export async function getTeamAssignmentHistory(
  groupId: string,
  maxResults: number = 10
): Promise<TeamAssignment[]> {
  try {
    // First, get the games for this group
    const gamesQuery = query(
      collection(db, "games"),
      where("groupId", "==", groupId),
      orderBy("date", "desc"),
      limit(50) // Get more games than we need to filter for ones with team assignments
    );
    
    const gameDocs = await getDocs(gamesQuery);
    const gameIds = gameDocs.docs.map(doc => doc.id);
    
    // Now, get the team assignments for these games
    const teamAssignments: TeamAssignment[] = [];
    
    for (const gameId of gameIds) {
      const teamAssignment = await getTeamAssignments(gameId);
      
      if (teamAssignment) {
        teamAssignments.push(teamAssignment);
        
        // If we have enough results, stop
        if (teamAssignments.length >= maxResults) {
          break;
        }
      }
    }
    
    return teamAssignments;
  } catch (error) {
    console.error("Error getting team assignment history:", error);
    throw new Error("Failed to get team assignment history");
  }
}
