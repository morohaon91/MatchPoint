import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { GroupMember, Group } from "@/lib/types/models";

/**
 * Check if a user can manage a group
 * 
 * @param userId - The ID of the user
 * @param groupId - The ID of the group
 * @returns A promise that resolves to a boolean indicating if the user can manage the group
 */
export async function canManageGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    
    if (!groupDoc.exists()) {
      return false;
    }
    
    const group = groupDoc.data() as Group;
    
    // Check if user is in adminIds array
    return group.adminIds?.includes(userId) || false;
  } catch (error) {
    console.error("Error checking group management permission:", error);
    return false;
  }
}

/**
 * Check if a user can manage games for a group
 * 
 * @param userId - The ID of the user
 * @param groupId - The ID of the group
 * @returns A promise that resolves to a boolean indicating if the user can manage games
 */
export async function canManageGames(userId: string, groupId: string): Promise<boolean> {
  // For now, the same permissions as managing the group
  return canManageGroup(userId, groupId);
}

/**
 * Check if a user is a member of a group
 * 
 * @param userId - The ID of the user
 * @param groupId - The ID of the group
 * @returns A promise that resolves to a boolean indicating if the user is a member
 */
export async function isGroupMember(userId: string, groupId: string): Promise<boolean> {
  try {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    
    if (!groupDoc.exists()) {
      return false;
    }
    
    const group = groupDoc.data() as Group;
    
    // Check if user is in memberIds array
    return group.memberIds?.includes(userId) || false;
  } catch (error) {
    console.error("Error checking group membership:", error);
    return false;
  }
}
