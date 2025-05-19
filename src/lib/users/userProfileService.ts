import { db } from "@/lib/firebase/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { UserProfile, SportType } from "@/lib/types/models";

/**
 * Check if a user's profile is complete
 *
 * @param userId - The ID of the user
 * @returns A promise that resolves to true if the profile is complete, false otherwise
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return false;
    }

    // Check for required fields
    // This can be customized based on what fields are considered necessary for a complete profile
    const requiredFields = [
      profile.name,
      profile.location,
      Array.isArray(profile.sportsPreferences) &&
        profile.sportsPreferences.length > 0,
    ];

    // Profile is complete if all required fields are present
    return requiredFields.every((field) => Boolean(field));
  } catch (error) {
    console.error("Error checking profile completeness:", error);
    // Default to true to avoid showing unnecessary warnings
    return true;
  }
}

/**
 * Get a user's profile
 *
 * @param userId - The ID of the user
 * @returns A promise that resolves to the user profile or null if not found
 */
export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Update a user's profile
 *
 * @param userId - The ID of the user
 * @param profileData - The profile data to update
 * @returns A promise that resolves when the profile is updated
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<Omit<UserProfile, "uid" | "email" | "createdAt">>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), profileData);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}

/**
 * Update a user's sports preferences
 *
 * @param userId - The ID of the user
 * @param sportsPreferences - The sports preferences to update
 * @returns A promise that resolves when the sports preferences are updated
 */
export async function updateSportsPreferences(
  userId: string,
  sportsPreferences: SportType[],
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), { sportsPreferences });
  } catch (error) {
    console.error("Error updating sports preferences:", error);
    throw new Error("Failed to update sports preferences");
  }
}

/**
 * Update a user's availability
 *
 * @param userId - The ID of the user
 * @param availability - The availability to update
 * @returns A promise that resolves when the availability is updated
 */
export async function updateAvailability(
  userId: string,
  availability: {
    morning?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    weekend?: boolean;
  },
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), { availability });
  } catch (error) {
    console.error("Error updating availability:", error);
    throw new Error("Failed to update availability");
  }
}
