"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getSportIcon } from "../SmartDashboard";

interface PendingInvitesWidgetProps {
  pendingGroupInvites: Group[];
  currentUser: User;
  onAcceptInvite: (groupId: string) => Promise<void>;
  onDeclineInvite: (groupId: string) => Promise<void>;
}

export default function PendingInvitesWidget({
  pendingGroupInvites,
  currentUser,
  onAcceptInvite,
  onDeclineInvite,
}: PendingInvitesWidgetProps) {
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);

  const handleAccept = async (groupId: string) => {
    setLoadingInviteId(groupId);
    try {
      await onAcceptInvite(groupId);
    } catch (error) {
      console.error("Failed to accept invite:", error);
      // TODO: Show error to user
    } finally {
      setLoadingInviteId(null);
    }
  };

  const handleDecline = async (groupId: string) => {
    setLoadingInviteId(groupId);
    try {
      await onDeclineInvite(groupId);
    } catch (error) {
      console.error("Failed to decline invite:", error);
      // TODO: Show error to user
    } finally {
      setLoadingInviteId(null);
    }
  };

  return (
    <Card variant="elevated" className="rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 group">
      <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
        <CardTitle className="flex items-center text-lg font-semibold text-neutral-700 dark:text-neutral-200">
          {/* Using EnvelopeIcon or BellAlertIcon from Heroicons */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-400">
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
          Pending Group Invites
        </CardTitle>
        <CardDescription className="ml-[34px] mt-1 text-neutral-500 dark:text-neutral-400 text-sm">
          {pendingGroupInvites.length > 0 
            ? `You have ${pendingGroupInvites.length} pending invitation${pendingGroupInvites.length > 1 ? 's' : ''}.`
            : "No pending group invitations at the moment."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 bg-white dark:bg-neutral-800/30">
        {pendingGroupInvites.length > 0 ? (
          <div className="space-y-3">
            {pendingGroupInvites.map((group) => (
              <div
                key={group.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-neutral-50 dark:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-600/80 rounded-lg shadow-sm hover:border-primary-300 dark:hover:border-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 ease-in-out"
              >
                <div className="flex items-center space-x-3 flex-grow min-w-0">
                  <Avatar 
                    size="md" 
                    sportType={group.sport.toLowerCase() as any}
                    withBorder
                    className="flex-shrink-0"
                  >
                    {group.photoURL ? (
                      <AvatarImage src={group.photoURL} alt={group.name} className="object-cover"/>
                    ) : (
                      <AvatarFallback sportType={group.sport.toLowerCase() as any} className="flex items-center justify-center w-10 h-10 text-lg">
                        {getSportIcon(group.sport)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <Link href={`/app/groups/${group.id}`} legacyBehavior>
                      <a className="font-semibold text-md text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200 hover:underline transition-colors truncate block">
                        {group.name}
                      </a>
                    </Link>
                    <div className="flex items-center mt-0.5">
                      <Badge
                        sportType={group.sport.toLowerCase() as any}
                        size="xs"
                        className="mr-1.5 px-1.5 py-0.5"
                      >
                        {group.sport}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAccept(group.id)}
                    isLoading={loadingInviteId === group.id}
                    disabled={
                      loadingInviteId !== null && loadingInviteId !== group.id
                    }
                    className="shadow-sm hover:shadow-md transition-all duration-200 ease-in-out py-1.5 px-3 text-xs font-medium flex-1 sm:flex-none hover:opacity-90"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(group.id)}
                    isLoading={loadingInviteId === group.id}
                    disabled={
                      loadingInviteId !== null && loadingInviteId !== group.id
                    }
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-600 dark:hover:bg-error-700/30 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out py-1.5 px-3 text-xs font-medium flex-1 sm:flex-none hover:opacity-90"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
            <div className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-750 flex items-center justify-center shadow-inner">
              {/* Check Circle Icon for empty state */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-500 dark:text-green-400">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-md font-medium">
              All caught up!
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              You have no pending group invitations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
