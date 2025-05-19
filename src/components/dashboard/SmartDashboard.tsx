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
  switch (sport) {
    case SportType.TENNIS:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case SportType.BASKETBALL:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z" clipRule="evenodd" />
        </svg>
      );
    case SportType.SOCCER:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5a.75.75 0 000-1.5H9a.75.75 0 000 1.5h6z" clipRule="evenodd" />
        </svg>
      );
    case SportType.VOLLEYBALL:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
        </svg>
      );
    case SportType.BASEBALL:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
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
    <div className="space-y-8 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700">
        <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-2 text-primary-500">
            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
          Welcome back, {currentUser.displayName || "Player"}!
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 ml-9">
          Here's your personalized dashboard
        </p>
      </div>

      {/* Main dashboard layout - enhanced grid with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
