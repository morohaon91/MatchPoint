"use client";

import React from "react";
import { User, Game, Group } from "@/lib/types/models";
// Import widget components
import NextGameWidget from "./widgets/NextGameWidget";
import PendingInvitesWidget from "./widgets/PendingInvitesWidget";
import QuickCreateGameWidget from "./widgets/QuickCreateGameWidget";
import UserGroupsPreviewWidget from "./widgets/UserGroupsPreviewWidget";

interface SmartDashboardProps {
  currentUser: User;
  userGames: Game[];
  pendingGroupInvites: Group[];
  userGroups: Group[];
  onAcceptGroupInvite: (groupId: string) => Promise<void>;
  onDeclineGroupInvite: (groupId: string) => Promise<void>;
  onOpenCreateGameModal: () => void;
}

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
    <div className="space-y-6">
      <div className="text-2xl font-bold">
        Welcome back, {currentUser.displayName || "Player"}!
      </div>

      {/* Main dashboard layout - using a simple grid for now */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6 lg:col-span-2">
          <NextGameWidget games={userGames} currentUser={currentUser} />
          <UserGroupsPreviewWidget
            groups={userGroups}
            currentUser={currentUser}
          />
        </div>

        {/* Column 2 (Sidebar-like) */}
        <div className="space-y-6 lg:col-span-1">
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
        </div>
      </div>
    </div>
  );
}
