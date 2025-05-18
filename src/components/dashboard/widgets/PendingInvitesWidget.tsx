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

  if (pendingGroupInvites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Group Invites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500">No pending group invitations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Group Invites</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join these groups.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingGroupInvites.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Avatar size="md" sportType={group.sport.toLowerCase() as any}>
                {group.photoURL ? (
                  <AvatarImage src={group.photoURL} alt={group.name} />
                ) : (
                  <AvatarFallback sportType={group.sport.toLowerCase() as any}>
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <Link href={`/app/groups/${group.id}`} legacyBehavior>
                  <a className="font-semibold text-primary-600 hover:underline">
                    {group.name}
                  </a>
                </Link>
                <div className="text-sm text-neutral-500 flex items-center">
                  <Badge
                    sportType={group.sport.toLowerCase() as any}
                    size="xs"
                    className="mr-2"
                  >
                    {group.sport}
                  </Badge>
                  {group.memberCount} members
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
                className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900"
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
