"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getUserProfile } from "@/lib/firebase/userProfile";
import UserMenu from './UserMenu';

export default function UserAvatar() {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser?.uid) {
        setIsLoading(true);
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile?.displayName) {
            setDisplayName(profile.displayName);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();

    // Set up an interval to refresh the profile data every minute
    const intervalId = setInterval(loadUserProfile, 60000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  if (!currentUser || isLoading) {
    return null;
  }

  return (
    <UserMenu
      displayName={displayName || currentUser.displayName || 'Anonymous User'}
      email={currentUser.email || ''}
      photoURL={currentUser.photoURL}
    />
  );
}
