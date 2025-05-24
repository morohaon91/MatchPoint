'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types/userProfile';
import UserProfilePage from '@/components/profile/UserProfilePage';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/userProfile';
import { Timestamp } from 'firebase/firestore';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { currentUser, isLoadingAuth } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getUserProfile(currentUser.uid);
        if (userData) {
          // Convert Firestore Timestamps to Dates
          const profile: UserProfile = {
            ...userData,
            createdAt: (userData.createdAt as unknown as Timestamp)?.toDate() || new Date(),
            lastActiveAt: (userData.lastActiveAt as unknown as Timestamp)?.toDate() || new Date(),
            dateOfBirth: (userData.dateOfBirth as unknown as Timestamp)?.toDate() || new Date(),
          };
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoadingAuth) {
      loadProfile();
    }
  }, [currentUser, isLoadingAuth]);

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!currentUser || !profile) return;

    try {
      await updateUserProfile(currentUser.uid, updatedData);
      
      // Update local state
      setProfile({
        ...profile,
        ...updatedData,
      });

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error appropriately
    }
  };

  if (isLoading || isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!profile || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile Not Found</h1>
          <p className="mt-2 text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return <UserProfilePage profile={profile} onUpdate={handleProfileUpdate} />;
} 