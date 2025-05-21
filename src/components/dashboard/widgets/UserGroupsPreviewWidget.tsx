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
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getSportIcon } from "../SmartDashboard";

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
    <Card variant="elevated" className="rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 group">
      <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg font-semibold text-neutral-700 dark:text-neutral-200">
            {/* UserGroupIcon from Heroicons */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-400">
              <path d="M14.25 6.083a3.75 3.75 0 013.75 3.75v1.518l1.47-.85a.75.75 0 011.06.02l1.256 1.139a.75.75 0 01-.088 1.138l-1.424.997a.75.75 0 01-.576.018L18 13.589v2.661a3.75 3.75 0 01-3.75 3.75H9.75A3.75 3.75 0 016 16.25V9.833a3.75 3.75 0 013.75-3.75h4.5z" />
              <path d="M3 9.833A3.75 3.75 0 016.75 6.083h1.5c.193 0 .38.026.562.076A4.482 4.482 0 008.25 4.583a3.75 3.75 0 00-3.75 3.75v1.518l-1.47-.85a.75.75 0 00-1.06.02L.716 10.16a.75.75 0 00.088 1.138l1.424.997a.75.75 0 00.576.018L4.5 11.611V13.5a3.75 3.75 0 003.75 3.75h1.5c.193 0 .38.026.562.076A4.482 4.482 0 016.75 18.5a3.75 3.75 0 01-3.75-3.75V9.833z" />
            </svg>
            Your Groups
          </CardTitle>
          {groups.length > MAX_GROUPS_TO_SHOW && (
            <Link href="/app/groups" legacyBehavior>
              <Button variant="link" size="sm" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline">
                View All ({groups.length})
              </Button>
            </Link>
          )}
        </div>
        {groups.length === 0 && !groupsToShow.length && ( // Ensure description only shows if truly no groups to show
          <CardDescription className="ml-[34px] mt-1 text-neutral-500 dark:text-neutral-400 text-sm">
            You haven't joined or created any groups yet.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-5 bg-white dark:bg-neutral-800/30">
        {groupsToShow.length > 0 ? (
          <div className="space-y-3"> {/* Changed from grid to space-y for better list flow */}
            {groupsToShow.map((group) => (
              <Link
                key={group.id}
                href={`/app/groups/${group.id}`}
                legacyBehavior
              >
                <a className="flex items-center p-3.5 bg-neutral-50 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600/80 hover:border-primary-300 dark:hover:border-primary-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-px group/item">
                  <Avatar 
                    size="md" // Slightly smaller avatar for list items
                    sportType={group.sport.toLowerCase() as any}
                    className="mr-3.5 flex-shrink-0"
                    withBorder
                  >
                    <AvatarFallback sportType={group.sport.toLowerCase() as any} className="flex items-center justify-center w-9 h-9 text-lg"> {/* Ensure icon size is appropriate */}
                      {getSportIcon(group.sport)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0"> {/* Added min-w-0 for better truncation if needed */}
                    <div className="font-semibold text-md text-neutral-800 dark:text-neutral-100 truncate group-hover/item:text-primary-600 dark:group-hover/item:text-primary-300">{group.name}</div>
                    <div className="flex items-center mt-0.5">
                      <Badge 
                        sportType={group.sport.toLowerCase() as any} 
                        size="xs"
                        className="mr-1.5 px-1.5 py-0.5" // More compact badge
                      >
                        {group.sport}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                  </div>
                  {/* Chevron right icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover/item:text-primary-500 transition-colors ml-2 flex-shrink-0">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
            <div className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-750 flex items-center justify-center shadow-inner">
              {/* Magnifying glass or plus icon for empty state */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400 dark:text-neutral-500">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-md font-medium">
              No groups found yet.
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Why not create one or search for existing groups?
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 p-5 bg-neutral-50 dark:bg-neutral-800/50" withBorder>
        <Link href="/app/groups/create" legacyBehavior>
          <Button
            variant="primary"
            className="w-full sm:flex-1 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity" // Use flex-1 for equal width on sm
            sportType={
              (currentUser.sportPreferences?.[0]?.sport.toLowerCase() as any) ||
              "default" // Keep default or a specific sport color
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create New Group
          </Button>
        </Link>
        <Link href="/app/groups" legacyBehavior>
          <Button 
            variant="outline" 
            className="w-full sm:flex-1 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700/70 transition-colors duration-200" // Use flex-1
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            Find Groups
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
