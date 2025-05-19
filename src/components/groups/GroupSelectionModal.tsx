"use client";

import React, { useState, useEffect } from "react";
import { Group } from "@/lib/types/models";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/context/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebaseClient";

interface GroupSelectionModalProps {
  groups: Group[];
  onClose: () => void;
  isOpen: boolean;
}

export default function GroupSelectionModal({
  groups,
  onClose,
  isOpen,
}: GroupSelectionModalProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupRoles, setGroupRoles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user roles for each group - only when modal is opened
  useEffect(() => {
    // Only fetch roles when the modal is first opened
    if (!isOpen || !currentUser) return;

    // Skip if we already have roles for all groups
    if (Object.keys(groupRoles).length === groups.length && !isLoading) return;

    const fetchGroupRoles = async () => {
      if (groups.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const roles: Record<string, string> = {};

      try {
        // Fetch roles directly from each group's members subcollection
        for (const group of groups) {
          try {
            const memberRef = doc(
              db,
              "groups",
              group.id,
              "members",
              currentUser.uid,
            );
            const memberDoc = await getDoc(memberRef);

            if (memberDoc.exists()) {
              const memberData = memberDoc.data();
              roles[group.id] = memberData?.role || "member";
            } else {
              roles[group.id] = "member";
            }
          } catch (err) {
            console.error(`Error fetching role for group ${group.id}:`, err);
            roles[group.id] = "member";
          }
        }

        setGroupRoles(roles);
      } catch (error) {
        console.error("Error fetching group roles:", error);
        // Set default roles if fetch fails
        const defaultRoles: Record<string, string> = {};
        groups.forEach((group) => {
          defaultRoles[group.id] = "member";
        });
        setGroupRoles(defaultRoles);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupRoles();
  }, [isOpen, currentUser?.uid, groups, groupRoles, isLoading, currentUser]); // Include all dependencies

  if (!isOpen) return null;

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleContinue = () => {
    if (selectedGroupId) {
      router.push(`/app/games/create?groupId=${selectedGroupId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select a Group</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-neutral-600">
            Choose a group to create a game for:
          </p>
          <p className="mb-4 text-xs text-neutral-500 italic">
            Note: You need to be an admin or organizer of a group to create
            games.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {groups.length === 0 ? (
              <p className="text-neutral-500 italic">
                You don&apos;t have any groups yet. Join or create a group
                first.
              </p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGroupId === group.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                  onClick={() => handleGroupSelect(group.id)}
                >
                  <div className="flex items-center">
                    {group.photoURL ? (
                      <img
                        src={group.photoURL}
                        alt={group.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full mr-3 bg-neutral-200 flex items-center justify-center">
                        <span className="text-neutral-600 font-medium">
                          {group.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="font-medium">{group.name}</h3>
                      <div className="flex items-center">
                        <p className="text-sm text-neutral-500 mr-2">
                          {group.sport} • {group.memberCount} members
                        </p>
                        {groupRoles[group.id] && (
                          <Badge
                            variant={
                              groupRoles[group.id] === "admin" ||
                              groupRoles[group.id] === "organizer"
                                ? "success"
                                : "secondary"
                            }
                            size="sm"
                          >
                            {groupRoles[group.id]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedGroupId || groups.length === 0}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
