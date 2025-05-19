import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";
import { Group, GroupMember } from "@/lib/types/models"; // Added GroupMember

// Initialize Admin SDK
const adminApp = initializeAdmin();
const adminDb = adminApp.firestore();

/**
 * Validate group data and ensure all required fields are present
 * This function is used by admin services.
 *
 * @param groupData - The group data to validate
 * @param groupId - The ID of the group (for logging)
 * @returns Group with all required fields or null if invalid
 */
function validateGroupData(groupData: any, groupId: string): Group | null {
  if (!groupData || !groupData.id || !groupData.name) {
    console.warn(`AdminService: Group ${groupId} has invalid data:`, groupData);
    return null;
  }

  if (typeof groupData.isPublic !== "boolean") {
    console.warn(
      `AdminService: Group ${groupId} has undefined isPublic field, defaulting to false`,
    );
    groupData.isPublic = false;
  }

  return {
    id: groupData.id,
    name: groupData.name,
    description: groupData.description || "",
    sport: groupData.sport,
    isPublic: groupData.isPublic,
    createdBy: groupData.createdBy,
    createdAt: groupData.createdAt, // Firestore Timestamps will be handled correctly by Admin SDK
    memberCount: groupData.memberCount || 0,
    location: groupData.location || "",
    photoURL: groupData.photoURL || null,
  } as Group;
}

/**
 * Get groups for a user using Admin SDK (bypasses security rules)
 * Intended for server-side use where user identity is already verified.
 *
 * @param userId - The ID of the user to get groups for
 * @returns A promise that resolves to an array of groups
 */
export async function getUserGroupsAsAdmin(userId: string): Promise<Group[]> {
  if (!userId) {
    console.warn("getUserGroupsAsAdmin called with no userId");
    return [];
  }

  try {
    const membershipQuery = adminDb
      .collection("groupMembers")
      .where("userId", "==", userId);
    const membershipSnapshot = await membershipQuery.get();

    if (membershipSnapshot.empty) {
      console.log(
        `No group memberships found for user ${userId} via Admin SDK.`,
      );
      return [];
    }

    const groupIds = membershipSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return data && data.groupId ? data.groupId : null;
      })
      .filter((groupId) => groupId != null);

    if (groupIds.length === 0) {
      console.log(
        `No valid groupIds found in memberships for user ${userId} via Admin SDK.`,
      );
      return [];
    }

    console.log(`Admin SDK: Found group IDs for user ${userId}:`, groupIds);

    const groups: Group[] = [];

    if (groupIds.length > 0) {
      const groupRefs = groupIds.map((id) =>
        adminDb.collection("groups").doc(id),
      );
      // Fetch documents in batches of up to 30, as getAll has this limitation
      const MAX_GET_ALL_ARGS = 30;
      for (let i = 0; i < groupRefs.length; i += MAX_GET_ALL_ARGS) {
        const batch = groupRefs.slice(i, i + MAX_GET_ALL_ARGS);
        const groupDocsSnapshots = await adminDb.getAll(...batch);

        for (const groupDoc of groupDocsSnapshots) {
          if (groupDoc.exists) {
            const groupData = groupDoc.data();
            const validatedGroup = validateGroupData(groupData, groupDoc.id);
            if (validatedGroup) {
              groups.push(validatedGroup);
            } else {
              console.warn(
                `Admin SDK: Group data validation failed for ${groupDoc.id}`,
                groupData,
              );
            }
          } else {
            console.warn(
              `Admin SDK: Group with ID ${groupDoc.id} referenced in groupMembers but not found in groups collection.`,
            );
          }
        }
      }
    }

    console.log(
      `Admin SDK: Returning ${groups.length} groups for user ${userId}.`,
    );
    return groups;
  } catch (error) {
    console.error(
      `Error getting user groups with Admin SDK for user ${userId}:`,
      error,
    );
    return [];
  }
}

/**
 * Get a group by ID using Admin SDK (bypasses security rules)
 * Intended for server-side use where user identity is already verified.
 *
 * @param groupId - The ID of the group to get
 * @returns A promise that resolves to the group or null if not found
 */
export async function getGroupAsAdmin(groupId: string): Promise<Group | null> {
  if (!groupId) {
    console.warn("getGroupAsAdmin called with no groupId");
    return null;
  }

  try {
    const groupDoc = await adminDb.collection("groups").doc(groupId).get();

    if (!groupDoc.exists) {
      console.warn(`Admin SDK: Group ${groupId} not found.`);
      return null;
    }

    const groupData = groupDoc.data();
    // Assuming validateGroupData is compatible with data from Admin SDK
    return validateGroupData(groupData, groupId);
  } catch (error) {
    console.error(`Error getting group ${groupId} with Admin SDK:`, error);
    return null; // Or throw, depending on desired error handling
  }
}

/**
 * Checks if a user is a member of a group using Admin SDK.
 *
 * @param userId - The ID of the user.
 * @param groupId - The ID of the group.
 * @returns A promise that resolves to true if the user is a member, false otherwise.
 */
export async function isGroupMemberAsAdmin(
  userId: string,
  groupId: string,
): Promise<boolean> {
  if (!userId || !groupId) {
    return false;
  }
  try {
    const memberDoc = await adminDb
      .collection("groupMembers")
      .doc(`${groupId}_${userId}`)
      .get();
    return memberDoc.exists;
  } catch (error) {
    console.error(
      `Error checking group membership for user ${userId} in group ${groupId} with Admin SDK:`,
      error,
    );
    return false; // Default to false on error
  }
}

/**
 * Get members of a group using Admin SDK.
 *
 * @param groupId - The ID of the group to get members for.
 * @returns A promise that resolves to an array of group members.
 */
export async function getGroupMembersAsAdmin(
  groupId: string,
): Promise<Omit<GroupMember, "user">[]> {
  // Return type matches client-side structure before enrichment
  if (!groupId) {
    console.warn("getGroupMembersAsAdmin called with no groupId");
    return [];
  }

  try {
    const membersQuery = adminDb
      .collection("groupMembers")
      .where("groupId", "==", groupId);
    const memberSnapshot = await membersQuery.get();

    if (memberSnapshot.empty) {
      return [];
    }

    const members = memberSnapshot.docs.map((doc) => {
      const data = doc.data();
      // Perform basic validation or casting
      return {
        id: doc.id,
        groupId: data.groupId,
        userId: data.userId,
        role: data.role,
        joinedAt: data.joinedAt, // Keep as Firestore Timestamp for now
      } as Omit<GroupMember, "user">; // Ensure this matches the expected structure before enrichment
    });

    return members;
  } catch (error) {
    console.error(
      `Error getting group members for group ${groupId} with Admin SDK:`,
      error,
    );
    return [];
  }
}

/**
 * Checks if a user can manage a group (admin or organizer) using Admin SDK.
 *
 * @param userId - The ID of the user.
 * @param groupId - The ID of the group.
 * @returns A promise that resolves to true if the user can manage, false otherwise.
 */
export async function canManageGroupAsAdmin(
  userId: string,
  groupId: string,
): Promise<boolean> {
  if (!userId || !groupId) {
    return false;
  }
  try {
    const memberDocSnap = await adminDb
      .collection("groupMembers")
      .doc(`${groupId}_${userId}`)
      .get();
    if (!memberDocSnap.exists) {
      return false;
    }
    const memberData = memberDocSnap.data();
    return memberData?.role === "admin" || memberData?.role === "organizer";
  } catch (error) {
    console.error(
      `Error checking group management permission for user ${userId} in group ${groupId} with Admin SDK:`,
      error,
    );
    return false;
  }
}
