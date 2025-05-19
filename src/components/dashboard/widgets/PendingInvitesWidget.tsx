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
    <Card variant="elevated" className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
        <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
          </svg>
          Pending Group Invites
        </CardTitle>
        <CardDescription className="ml-8 text-neutral-500 dark:text-neutral-400">
          {pendingGroupInvites.length > 0 
            ? "You've been invited to join these groups."
            : "No pending group invitations."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {pendingGroupInvites.length > 0 ? (
          <div className="space-y-4">
            {pendingGroupInvites.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <Avatar 
                    size="md" 
                    sportType={group.sport.toLowerCase() as any}
                    withBorder
                  >
                    {group.photoURL ? (
                      <AvatarImage src={group.photoURL} alt={group.name} />
                    ) : (
                      <AvatarFallback sportType={group.sport.toLowerCase() as any} className="flex items-center justify-center">
                        {getSportIcon(group.sport)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <Link href={`/app/groups/${group.id}`} legacyBehavior>
                      <a className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors">
                        {group.name}
                      </a>
                    </Link>
                    <div className="flex items-center mt-1">
                      <Badge
                        sportType={group.sport.toLowerCase() as any}
                        size="xs"
                        className="mr-2"
                      >
                        {group.sport}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {group.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAccept(group.id)}
                    isLoading={loadingInviteId === group.id}
                    disabled={
                      loadingInviteId !== null && loadingInviteId !== group.id
                    }
                    className="shadow-sm hover:shadow transition-shadow"
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
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/20 shadow-sm hover:shadow transition-shadow"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400">
                <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              No pending group invitations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
