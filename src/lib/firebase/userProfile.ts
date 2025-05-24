import { db } from './firebaseClient';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/types/userProfile';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function checkProfileComplete(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() && userDoc.data()?.profileComplete === true;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

export async function createUserProfile(user: User, profileData: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const profileToSave = {
      displayName: profileData.displayName || user.displayName || 'Anonymous User',
      email: user.email,
      photoURL: user.photoURL,
      phoneNumber: profileData.phoneNumber || null,
      dateOfBirth: profileData.dateOfBirth,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      emailVerified: user.emailVerified,
      primarySport: profileData.primarySport,
      secondarySports: profileData.secondarySports || [],
      availabilityPreferences: profileData.availabilityPreferences || {
        preferredDays: [],
        preferredTimeSlots: []
      },
      profileComplete: true
    };

    // Use setDoc with merge option to ensure we don't overwrite any existing data
    await setDoc(userRef, profileToSave, { merge: true });

    // Verify the data was saved by reading it back
    const savedDoc = await getDoc(userRef);
    if (!savedDoc.exists()) {
      throw new Error('Profile was not saved successfully');
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, profileData: Partial<UserProfile>) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...profileData,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
} 