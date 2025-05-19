"use client";

import React from "react";
import Link from "next/link";
import { Group, User } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ModernGroupCard from "@/components/groups/ModernGroupCard"; // Assuming this can be reused

interface UserGroupsPreviewWidgetProps {
  groups: Group[]; // Groups user is a member of
  currentUser: User;
  // TODO: Add onJoinGroup and onCreateGroup handlers if they trigger modals locally
}

const MAX_GROUPS_TO_SHOW = 3;

export default function UserGroupsPreviewWidget({
  groups,
  currentUser,
}: UserGroupsPreviewWidgetProps) {
  const groupsToShow = groups.slice(0, MAX_GROUPS_TO_SHOW);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Your Groups</CardTitle>
          {groups.length > MAX_GROUPS_TO_SHOW && (
            <Link href="/app/groups" legacyBehavior>
              <Button variant="link" size="sm">
                View All ({groups.length})
              </Button>
            </Link>
          )}
        </div>
        {groups.length === 0 && (
          <CardDescription>
            You haven&apos;t joined or created any groups yet.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {groupsToShow.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {/* 
              Using a simplified display here. ModernGroupCard might be too large for a preview.
              Consider creating a smaller GroupListItem component or adapting ModernGroupCard.
              For now, basic info:
            */}
            {groupsToShow.map((group) => (
              <Link
                key={group.id}
                href={`/app/groups/${group.id}`}
                legacyBehavior
              >
                <a className="block p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <div className="font-semibold">{group.name}</div>
                  <div className="text-sm text-neutral-500">
                    {group.sport} - {group.memberCount} members
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
        {groups.length === 0 && (
          <p className="text-sm text-neutral-500">
            Join a group to connect with other players or create your own!
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2" withBorder>
        <Link href="/app/groups/create" legacyBehavior>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            sportType={
              (currentUser.sportPreferences?.[0]?.sport.toLowerCase() as any) ||
              "default"
            }
          >
            Create New Group
          </Button>
        </Link>
        <Link href="/app/groups" legacyBehavior>
          <Button variant="outline" className="w-full sm:w-auto">
            Find Groups
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
