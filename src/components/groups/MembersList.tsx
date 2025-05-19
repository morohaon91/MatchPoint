"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Group, GroupMember } from "@/lib/types/models";
import InviteMembersModal from "./InviteMembersModal";

interface MembersListProps {
  group: Group;
  members: GroupMember[];
  isAdmin?: boolean;
  isLoading?: boolean;
  onRoleChange?: (memberId: string, newRole: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onMemberInvited?: () => void;
}

/**
 * MembersList component displays and manages group members
 */
export default function MembersList({
  group,
  members = [],
  isAdmin = false,
  isLoading = false,
  onRoleChange,
  onRemoveMember,
  onMemberInvited,
}: MembersListProps) {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  const toggleMemberExpand = (memberId: string) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const handleInviteSent = () => {
    if (onMemberInvited) {
      onMemberInvited();
    }
    // Keep the modal open to allow sending more invites
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Members ({members.length})
        </h3>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenInviteModal}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">No members found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-md">
          {members.map((member) => (
            <li key={member.userId} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    {member.user?.photoURL ? (
                      <Image
                        src={member.user.photoURL}
                        alt={member.user.name || "User"}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {member.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {member.user?.name || "Unknown User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user?.email || ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : member.role === "organizer"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {member.role}
                  </span>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => toggleMemberExpand(member.userId)}
                      className="ml-2 text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {isAdmin && expandedMember === member.userId && (
                <div className="mt-4 pl-14 flex flex-col sm:flex-row sm:items-center gap-3">
                  {onRoleChange && (
                    <div>
                      <label
                        htmlFor={`role-${member.userId}`}
                        className="sr-only"
                      >
                        Change role
                      </label>
                      <select
                        id={`role-${member.userId}`}
                        value={member.role}
                        onChange={(e) =>
                          onRoleChange(member.userId, e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}

                  {onRemoveMember && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.userId)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Invite Members Modal */}
      <InviteMembersModal
        group={group}
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
}
