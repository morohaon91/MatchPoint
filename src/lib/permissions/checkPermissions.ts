import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";
import { GroupMember } from "@/lib/types/models";

/**
 * Check if a user can manage a group
 * 
 * @param userId - The ID of the user
 * @param groupId - The ID of the group
 * @returns A promise that resolves to a boolean indicating if the user can manage the group
 */
export async function canManageGroup(userId: string, groupId: string): Promise<boolean> {
  try {
    const membershipDoc = await getDoc(doc(db, "groupMembers", `${groupId}_${userId}`));
    
    if (!membershipDoc.exists()) {
      return false;
    }
    
    const membership = membershipDoc.data() as GroupMember;
    
    // Admin and organizer roles can manage the group
    return membership.role === 'admin' || membership.role === 'organizer';
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
    const membershipDoc = await getDoc(doc(db, "groupMembers", `${groupId}_${userId}`));
    return membershipDoc.exists();
  } catch (error) {
    console.error("Error checking group membership:", error);
    return false;
  }
}
