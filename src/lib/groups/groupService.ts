/**
 * Service functions for group management
 */
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient"; // Corrected Firebase config import path
import { Group, GroupMember, UserRole } from "@/lib/types/models"; // UserRole for admin
import { generateInviteCode } from "./inviteUtils"; // Keep for auto-generation
import { getAuth } from "firebase/auth";

/**
 * Creates a new group
 * @param groupData The group data to create
 * @param userId The ID of the user creating the group
 * @returns The created group
 */
export async function createGroup(
  groupData: Partial<Group>,
  userId: string,
): Promise<Group> {
  try {
    const batch = writeBatch(db);

    // 1. Create a new document reference for the group in the 'groups' collection
    const groupRef = doc(collection(db, "groups"));

    const newGroupData: Omit<Group, "id" | "createdAt" | "updatedAt"> & {
      createdAt: any;
      updatedAt: any;
    } = {
      name: groupData.name || "Unnamed Group",
      sport: groupData.sport!, // SportType is required
      description: groupData.description || "",
      isPublic: groupData.isPublic || false,
      invitationCode: groupData.invitationCode || generateInviteCode(), // Use provided or generate
      createdBy: userId,
      adminIds: [userId], // Creator is the first admin
      memberIds: [userId], // Creator is the first member
      memberCount: 1,
      // photoURL: groupData.photoURL || undefined, // Will be handled conditionally
      // location: groupData.location || undefined, // Will be handled conditionally
      invitedUserIds: [], // Initialize as empty
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Conditionally add photoURL and location
    if (groupData.photoURL) {
      newGroupData.photoURL = groupData.photoURL;
    }
    if (groupData.location) {
      newGroupData.location = groupData.location;
    }

    batch.set(groupRef, newGroupData);

    // 2. Create a document for the creator in the 'members' subcollection of the new group
    // Collection path: groups/{groupId}/members/{userId}
    const memberRef = doc(db, "groups", groupRef.id, "members", userId);
    batch.set(memberRef, {
      userId: userId,
      role: UserRole.ADMIN, // Assign 'admin' role from UserRole enum
      joinedAt: serverTimestamp(),
      // You might want to denormalize basic user info here if needed for queries
      // e.g., displayName: currentUser.displayName, photoURL: currentUser.photoURL
    });

    // Commit the batch
    await batch.commit();

    // Return the newly created group data, now with an ID
    return {
      id: groupRef.id,
      ...newGroupData,
      createdAt: new Date(), // Approximate for return, actual is serverTimestamp
      updatedAt: new Date(), // Approximate for return
    } as Group;
  } catch (error) {
    console.error("Error creating group in Firestore:", error);
    // Re-throw the error or handle it as per your application's error handling strategy
    throw new Error(
      `Failed to create group: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Updates an existing group
 * @param groupId The ID of the group to update
 * @param groupData The updated group data
 * @returns The updated group
 */
export async function updateGroup(
  groupId: string,
  groupData: Partial<Group>,
): Promise<Group> {
  // In a real app, this would update a group in Firestore
  // For now, we'll simulate a successful update

  console.log(`Updating group ${groupId} with data:`, groupData);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a mock updated group object
  return {
    id: groupId,
    name: groupData.name || "Updated Group",
    description: groupData.description || "",
    sport: groupData.sport!,
    isPublic: groupData.isPublic || false,
    location: groupData.location,
    createdBy: "user123",
    createdAt: new Date(),
    updatedAt: new Date(), // Added missing property
    memberIds: ["user123", "user456"], // Added missing property (mock)
    adminIds: ["user123"], // Added missing property (mock)
    memberCount: 5,
    photoURL: groupData.photoURL || undefined, // Corrected from null to undefined
    invitationCode: "ABC123",
  };
}

/**
 * Deletes a group
 * @param groupId The ID of the group to delete
 * @returns A promise that resolves when the group is deleted
 */
export async function deleteGroup(groupId: string): Promise<void> {
  // In a real app, this would delete a group from Firestore
  // For now, we'll simulate a successful deletion

  console.log(`Deleting group ${groupId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return Promise.resolve();
}

/**
 * Joins a group
 * @param groupId The ID of the group to join
 * @param userId The ID of the user joining the group
 * @returns The group member object
 */
export async function joinGroup(
  groupId: string,
  userId: string,
): Promise<GroupMember> {
  // In a real app, this would add a member to a group in Firestore
  // For now, we'll simulate a successful join

  console.log(`User ${userId} joining group ${groupId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a mock group member object
  return {
    userId,
    role: UserRole.USER, // Use UserRole enum
    // joinedAt: new Date(), // Not in GroupMember type, remove or add to type
    user: {
      name: "Demo User", // Example, ideally fetch or pass user details
      email: "user@example.com",
      photoURL: undefined,
    },
  };
}

/**
 * Leaves a group
 * @param groupId The ID of the group to leave
 * @param userId The ID of the user leaving the group
 * @returns A promise that resolves when the user has left the group
 */
export async function leaveGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  // In a real app, this would remove a member from a group in Firestore
  // For now, we'll simulate a successful leave

  console.log(`User ${userId} leaving group ${groupId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return Promise.resolve();
}

/**
 * Updates a member's role in a group
 * @param groupId The ID of the group
 * @param userId The ID of the user to update
 * @param newRole The new role for the user
 * @returns A promise that resolves when the role is updated
 */
export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: "admin" | "organizer" | "member",
): Promise<void> {
  // In a real app, this would update a member's role in Firestore
  // For now, we'll simulate a successful update

  console.log(`Updating user ${userId} to role ${newRole} in group ${groupId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return Promise.resolve();
}

/**
 * Removes a member from a group
 * @param groupId The ID of the group
 * @param userId The ID of the user to remove
 * @returns A promise that resolves when the member is removed
 */
export async function removeMember(
  groupId: string,
  userId: string,
): Promise<void> {
  // In a real app, this would remove a member from a group in Firestore
  // For now, we'll simulate a successful removal

  console.log(`Removing user ${userId} from group ${groupId}`);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return Promise.resolve();
}

/**
 * Regenerates a group's invitation code
 * @param groupId The ID of the group
 * @returns The new invitation code
 */
export async function regenerateInviteCode(groupId: string): Promise<string> {
  // In a real app, this would update the invitation code in Firestore
  // For now, we'll simulate a successful regeneration

  console.log(`Regenerating invite code for group ${groupId}`);

  // Generate a new invitation code
  const newCode = generateInviteCode();

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return newCode;
}

/**
 * Fetches all groups a user is a member of.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Group objects.
 */
export async function getUserGroups(userId: string): Promise<Group[]> {
  if (!userId) {
    console.warn("getUserGroups called with no userId");
    return [];
  }
  try {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("memberIds", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      const groupData = doc.data() as Omit<
        Group,
        "id" | "createdAt" | "updatedAt"
      > & { createdAt: Timestamp; updatedAt: Timestamp };
      groups.push({
        id: doc.id,
        ...groupData,
        createdAt: groupData.createdAt.toDate(),
        updatedAt: groupData.updatedAt.toDate(),
      } as Group);
    });
    return groups;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw new Error(
      `Failed to fetch user groups: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches pending group invitations for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Group objects representing invitations.
 */
export async function getPendingGroupInvitesForUser(
  userId: string,
): Promise<Group[]> {
  if (!userId) {
    console.warn("getPendingGroupInvitesForUser called with no userId");
    return [];
  }
  try {
    const groupsRef = collection(db, "groups");
    const q = query(
      groupsRef,
      where("invitedUserIds", "array-contains", userId),
    );
    const querySnapshot = await getDocs(q);
    const invites: Group[] = [];
    querySnapshot.forEach((doc) => {
      const groupData = doc.data() as Omit<
        Group,
        "id" | "createdAt" | "updatedAt"
      > & { createdAt: Timestamp; updatedAt: Timestamp };
      invites.push({
        id: doc.id,
        ...groupData,
        createdAt: groupData.createdAt.toDate(),
        updatedAt: groupData.updatedAt.toDate(),
      } as Group);
    });
    return invites;
  } catch (error) {
    console.error("Error fetching pending group invites:", error);
    throw new Error(
      `Failed to fetch pending group invites: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches a single group by its ID.
 * @param groupId The ID of the group to fetch.
 * @returns A promise that resolves to the Group object or null if not found.
 */
export async function getGroupById(groupId: string): Promise<Group | null> {
  if (!groupId) {
    console.warn("getGroupById called with no groupId");
    return null;
  }
  try {
    const groupRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(groupRef);

    if (docSnap.exists()) {
      const groupData = docSnap.data() as Omit<
        Group,
        "id" | "createdAt" | "updatedAt"
      > & { createdAt: Timestamp; updatedAt: Timestamp };
      // Ensure all necessary fields are present and correctly typed
      return {
        id: docSnap.id,
        name: groupData.name,
        sport: groupData.sport,
        description: groupData.description || "",
        isPublic: groupData.isPublic || false,
        invitationCode: groupData.invitationCode || "",
        createdBy: groupData.createdBy,
        adminIds: groupData.adminIds || [],
        memberIds: groupData.memberIds || [],
        memberCount: groupData.memberCount || 0,
        photoURL: groupData.photoURL || undefined,
        location: groupData.location || undefined,
        invitedUserIds: groupData.invitedUserIds || [],
        tags: groupData.tags || [],
        createdAt: groupData.createdAt.toDate(),
        updatedAt: groupData.updatedAt.toDate(),
      } as Group;
    } else {
      console.log(`No group found with ID: ${groupId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching group by ID ${groupId}:`, error);
    throw new Error(
      `Failed to fetch group ${groupId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches all members of a specific group.
 * @param groupId The ID of the group.
 * @returns A promise that resolves to an array of GroupMember objects.
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  if (!groupId) {
    console.warn("getGroupMembers called with no groupId");
    return [];
  }
  try {
    // First get the group document to get the list of member IDs and admin IDs
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) {
      console.log(`No group found with ID: ${groupId}`);
      return [];
    }
    const groupData = groupSnap.data();
    const memberIds = groupData.memberIds || [];
    const adminIds = groupData.adminIds || [];
    // No members in the group
    if (memberIds.length === 0) {
      return [];
    }
    // Fetch user data for each member ID
    const memberPromises = memberIds.map(async (userId) => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        // Create the GroupMember object
        const member: GroupMember = {
          userId,
          // Assign role based on whether the user is in adminIds
          role: adminIds.includes(userId) ? "admin" : "member",
          user: {},
        };
        // If user document exists, add user details
        if (userSnap.exists()) {
          const userData = userSnap.data();
          member.user = {
            name: userData.displayName || userData.name || "Unknown User",
            email: userData.email || "",
            photoURL: userData.photoURL || undefined,
          };
        } else {
          member.user = {
            name: "Unknown User",
            email: "",
            photoURL: undefined,
          };
        }
        return member;
      } catch (error) {
        console.error(`Error fetching user ${userId} details:`, error);
        // Return a minimal member object if there's an error
        return {
          userId,
          role: adminIds.includes(userId) ? "admin" : "member",
          user: { name: "Unknown User", email: "", photoURL: undefined },
        };
      }
    });
    const members = await Promise.all(memberPromises);
    return members;
  } catch (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    throw new Error(
      `Failed to fetch members for group ${groupId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Gets all public groups
 * @returns A promise that resolves to an array of public groups
 */
export async function getPublicGroups(): Promise<Group[]> {
  try {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("isPublic", "==", true));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Group,
    );
  } catch (error) {
    console.error("Error fetching public groups:", error);
    throw new Error(
      `Failed to fetch public groups: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Ensures a user document exists in Firestore with basic profile information
 * @param userId The ID of the user
 * @param userData Optional user data to set
 */
async function ensureUserDocument(
  userId: string,
  userData?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  }
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create the user document if it doesn't exist
      await setDoc(userRef, {
        displayName: userData?.displayName || "Unknown User",
        email: userData?.email || "",
        photoURL: userData?.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error ensuring user document:", error);
    // Don't throw, as this is a supplementary operation
  }
}

/**
 * Accepts a group invitation for a user
 * @param groupId The ID of the group
 * @param userId The ID of the user accepting the invitation
 * @returns A promise that resolves when the invitation is accepted
 */
export async function acceptGroupInvite(
  groupId: string,
  userId: string,
): Promise<void> {
  if (!groupId || !userId) {
    throw new Error("Group ID and user ID are required");
  }

  try {
    const groupRef = doc(db, "groups", groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupDoc.data() as DocumentData;
    
    // Check if user is actually invited
    const invitedUserIds = groupData.invitedUserIds as string[] | undefined;
    if (!invitedUserIds?.includes(userId)) {
      throw new Error("User is not invited to this group");
    }

    // Check if user is already a member
    const memberIds = groupData.memberIds as string[] | undefined;
    if (memberIds?.includes(userId)) {
      throw new Error("User is already a member of this group");
    }

    // Get the current user's auth data to create their user document
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      await ensureUserDocument(userId, {
        displayName: currentUser.displayName || undefined,
        email: currentUser.email || undefined,
        photoURL: currentUser.photoURL || undefined,
      });
    }

    // Update the group document
    await updateDoc(groupRef, {
      memberIds: arrayUnion(userId),
      invitedUserIds: arrayRemove(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error accepting group invite:", error);
    throw new Error(
      `Failed to accept group invite: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
