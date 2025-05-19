"use client";

import React from "react";
import { User, Game, Group, SportType } from "@/lib/types/models";
// Import widget components
import NextGameWidget from "./widgets/NextGameWidget";
import PendingInvitesWidget from "./widgets/PendingInvitesWidget";
import QuickCreateGameWidget from "./widgets/QuickCreateGameWidget";
import UserGroupsPreviewWidget from "./widgets/UserGroupsPreviewWidget";
import GamesCalendarWidget from "./widgets/GamesCalendarWidget";

interface SmartDashboardProps {
  currentUser: User;
  userGames: Game[];
  pendingGroupInvites: Group[];
  userGroups: Group[];
  onAcceptGroupInvite: (groupId: string) => Promise<void>;
  onDeclineGroupInvite: (groupId: string) => Promise<void>;
  onOpenCreateGameModal: () => void;
}

// Helper function to get sport icon
export const getSportIcon = (sport: SportType): React.ReactNode => {
  // Using a larger size for better visual impact, can be adjusted per usage
  const iconSize = "w-6 h-6"; 
  switch (sport) {
    case SportType.TENNIS: // Tennis Ball Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.48 0 .9-.23 1.19-.59.51.49 1.2.84 1.98.94v1.65c0 .28.22.5.5.5s.5-.22.5-.5V13.5c.78-.1 1.47-.45 1.98-.94.29.36.71.59 1.19.59.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5c-.48 0-.9.23-1.19.59-.51-.49-1.2-.84-1.98-.94V7.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5v1.65c-.78.1-1.47.45-1.98.94-.29-.36-.71-.59-1.19-.59zM12 8.5c.64 0 1.2.29 1.58.75.38-.46.94-.75 1.58-.75.55 0 1 .45 1 1s-.45 1-1 1c-.64 0-1.2-.29-1.58-.75-.38.46-.94.75-1.58.75-.55 0-1-.45-1-1s.45-1 1-1zm0 5c-.64 0-1.2-.29-1.58-.75-.38.46-.94.75-1.58.75-.55 0-1-.45-1-1s.45-1 1-1c.64 0 1.2.29 1.58.75.38-.46.94-.75 1.58.75.55 0 1 .45 1 1s-.45 1-1 1z"/>
        </svg>
      );
    case SportType.BASKETBALL: // Basketball Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.5-12.5c.2-.2.48-.3.75-.3s.55.1.75.3l1.25 1.25c.2.2.3.48.3.75s-.1.55-.3.75L11.25 12l1.25 1.25c.2.2.3.48.3.75s-.1.55-.3.75l-1.25 1.25c-.2.2-.48.3-.75.3s-.55-.1-.75-.3L8.5 14.25c-.2-.2-.3-.48-.3-.75s.1-.55.3-.75L9.75 12 8.5 10.75c-.2-.2-.3-.48-.3-.75s.1-.55.3-.75l1-1zm5 5c.2-.2.48-.3.75-.3s.55.1.75.3l1.25 1.25c.2.2.3.48.3.75s-.1.55-.3.75L16.25 17l1.25 1.25c.2.2.3.48.3.75s-.1.55-.3.75l-1.25 1.25c-.2.2-.48.3-.75.3s-.55-.1-.75-.3L13.5 19.25c-.2-.2-.3-.48-.3-.75s.1-.55.3-.75L14.75 17l-1.25-1.25c-.2-.2-.3-.48-.3-.75s.1-.55.3-.75l1-1zM12 6.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S10.5 8.83 10.5 8 9.17 6.5 12 6.5zm0 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5S12.83 15.5 12 15.5z"/>
        </svg>
      );
    case SportType.SOCCER: // Soccer Ball Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.5-9.5l3-3 .71.71-2.29 2.29H13v-1h-1.59l2.29-2.29-.71-.71-3 3-1.06 1.06L7.5 12.5zm4.5 2l-3 3-.71-.71 2.29-2.29H11v1h1.59l-2.29 2.29.71.71 3-3 1.06-1.06L16.5 11.5z"/>
        </svg>
      );
    case SportType.VOLLEYBALL: // Volleyball Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2.28c.6.43 1 .94 1.28 1.54.28-.6.68-1.11 1.28-1.54V7h2v2.28c-.6.43-1 .94-1.28 1.54.58.64.93 1.43.93 2.28 0 .9-.39 1.69-1 2.26v2.64h-2v-2.64c-.61-.57-1-1.36-1-2.26 0-.85.35-1.64.93-2.28C12 10.22 11.6 9.71 11 9.28V7zm1 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
        </svg>
      );
    case SportType.BASEBALL: // Baseball Icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-2.5-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"/>
        </svg>
      );
    default: // Generic placeholder (e.g., a simple circle or sports medal)
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 16.5a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M12 7.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 7.5zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75A.75.75 0 0112 15z" clipRule="evenodd" />
        </svg>
      );
  }
};

export default function SmartDashboard({
  currentUser,
  userGames,
  pendingGroupInvites,
  userGroups,
  onAcceptGroupInvite,
  onDeclineGroupInvite,
  onOpenCreateGameModal,
}: SmartDashboardProps) {
  return (
    <div className="space-y-8 bg-neutral-100 dark:bg-neutral-950 p-6 rounded-lg"> {/* Adjusted padding and background */}
      {/* Enhanced Welcome Card */}
      <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-850 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mr-3 text-primary-500 dark:text-primary-400">
            {/* Using a more vibrant/welcoming icon - e.g., Sparkles or a simple checkmark in a circle */}
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
          </svg>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Welcome back, {currentUser.displayName || "Player"}!
          </h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 ml-11 text-md">
          Here's your personalized dashboard, ready for action.
        </p>
      </div>

      {/* Main dashboard layout - enhanced grid with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Slightly reduced gap for a more compact feel if desired, or keep at 8 */}
        {/* Column 1 */}
        <div className="space-y-8 lg:col-span-2">
          <NextGameWidget games={userGames} currentUser={currentUser} />
          <UserGroupsPreviewWidget
            groups={userGroups}
            currentUser={currentUser}
          />
        </div>

        {/* Column 2 (Sidebar-like) */}
        <div className="space-y-8 lg:col-span-1">
          <PendingInvitesWidget
            pendingGroupInvites={pendingGroupInvites}
            currentUser={currentUser}
            onAcceptInvite={onAcceptGroupInvite}
            onDeclineInvite={onDeclineGroupInvite}
          />
          <QuickCreateGameWidget
            currentUser={currentUser}
            onOpenCreateGameModal={onOpenCreateGameModal}
          />
          <GamesCalendarWidget games={userGames} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
