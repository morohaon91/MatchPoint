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
    <Card variant="elevated" className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
              <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
              <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
            </svg>
            Your Groups
          </CardTitle>
          {groups.length > MAX_GROUPS_TO_SHOW && (
            <Link href="/app/groups" legacyBehavior>
              <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                View All ({groups.length})
              </Button>
            </Link>
          )}
        </div>
        {groups.length === 0 && (
          <CardDescription className="ml-8 text-neutral-500 dark:text-neutral-400">
            You haven&apos;t joined or created any groups yet.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {groupsToShow.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {groupsToShow.map((group) => (
              <Link
                key={group.id}
                href={`/app/groups/${group.id}`}
                legacyBehavior
              >
                <a className="flex items-center p-4 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-xl shadow-sm hover:shadow transition-all duration-300">
                  <Avatar 
                    size="lg" 
                    sportType={group.sport.toLowerCase() as any}
                    className="mr-4"
                    withBorder
                  >
                    <AvatarFallback sportType={group.sport.toLowerCase() as any} className="flex items-center justify-center">
                      {getSportIcon(group.sport)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">{group.name}</div>
                    <div className="flex items-center mt-1">
                      <Badge 
                        sportType={group.sport.toLowerCase() as any} 
                        size="xs"
                        className="mr-2"
                      >
                        {group.sport}
                      </Badge>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-400">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              Join a group to connect with other players or create your own!
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 bg-neutral-50 dark:bg-neutral-800" withBorder>
        <Link href="/app/groups/create" legacyBehavior>
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            sportType={
              (currentUser.sportPreferences?.[0]?.sport.toLowerCase() as any) ||
              "default"
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
            Create New Group
          </Button>
        </Link>
        <Link href="/app/groups" legacyBehavior>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto hover:bg-white dark:hover:bg-neutral-700 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
            </svg>
            Find Groups
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
