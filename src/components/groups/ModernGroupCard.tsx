import React from "react";
import Link from "next/link";
import { GroupWithLastGame } from "@/app/app/groups/page"; // Use the enhanced type
import { Game, SportType } from "@/lib/types/models"; // Keep SportType if used directly, Game for lastGame
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Avatar,
  AvatarGroup,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/Avatar";
import { format, parseISO } from "date-fns"; // For formatting dates

interface ModernGroupCardProps {
  group: GroupWithLastGame; // Updated prop type
  // onJoin is removed as this page shows "my groups"
  onLeave?: (groupId: string) => void; // Keep onLeave if functionality is desired
  // isMember is implicitly true for this page, can be removed or defaulted if card is used elsewhere
  // memberCount will come from group.memberCount or group.memberIds.length
  memberAvatars?: Array<{ id: string; photoURL?: string; name?: string }>;
  // gamesCount is not being explicitly passed for now, card should handle its absence
  className?: string;
}

/**
 * ModernGroupCard component displays a group card with modern UI
 */
export default function ModernGroupCard({
  group,
  onLeave,
  memberAvatars = [],
  // gamesCount = 0, // Not explicitly passed for now
  className = "",
}: ModernGroupCardProps) {
  const { lastGame } = group; // Destructure lastGame from the group prop

  // Since this page is "My Groups", isMember is true.
  // The "Join Group" button is not needed. "Leave Group" can be optional.
  const actionButton = onLeave ? (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLeave(group.id)}
      className="text-error-500 border-error-500 hover:bg-error-50"
    >
      Leave Group
    </Button>
  ) : null;

  const displayMemberCount = group.memberCount || group.memberIds?.length || 0;

  return (
    <Card
      variant="elevated"
      sportType={group.sport}
      isHoverable
      className={`overflow-hidden ${className} flex flex-col`} // Added flex flex-col for footer positioning
    >
      <div className="flex-grow">
        {" "}
        {/* Added flex-grow to push footer down */}
        {/* Group image */}
        {group.photoURL ? (
          <div className="relative w-full h-40 overflow-hidden">
            <img
              src={group.photoURL}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/400x200?text=Group+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-2 left-2">
              <Badge sportType={group.sport} size="sm">
                {group.sport}
              </Badge>
            </div>
            <div className="absolute bottom-2 right-2">
              <Badge
                variant={group.isPublic ? "outline" : "secondary"}
                size="sm"
                className={group.isPublic ? "bg-white/80 backdrop-blur-sm" : ""}
              >
                {group.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        ) : (
          // Placeholder for groups without photoURL, matching Dashboard style
          <div className="relative w-full h-40 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg truncate">{group.name}</CardTitle>
            {/* "Member" badge can be shown by default as this page is for user's groups */}
            <Badge variant="success" size="sm">
              Member
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Group description */}
          {group.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
              {group.description}
            </p>
          )}

          {/* Location */}
          {group.location && (
            <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{group.location}</span>
            </div>
          )}

          {/* Group stats: Member Count and Last Game Played */}
          <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>
                {displayMemberCount} member{displayMemberCount === 1 ? "" : "s"}
              </span>
            </div>

            {lastGame && lastGame.scheduledTime && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Last Game:{" "}
                  {format(
                    parseISO(lastGame.scheduledTime as string),
                    "MMM d, yyyy",
                  )}
                  {lastGame.title && (
                    <span className="italic"> - {lastGame.title}</span>
                  )}
                </span>
              </div>
            )}
            {!lastGame && (
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>No games played yet</span>
              </div>
            )}
          </div>

          {/* Member avatars (optional, if data is provided) */}
          {memberAvatars.length > 0 && (
            <div className="mt-3">
              <AvatarGroup limit={5} size="xs" spacing="tight">
                {" "}
                {/* Adjusted size and spacing */}
                {memberAvatars.map((member) => (
                  <Avatar
                    key={member.id}
                    size="xs" // Adjusted size
                    sportType={group.sport} // Keep for consistent styling if Avatar uses it
                  >
                    {member.photoURL ? (
                      <AvatarImage
                        src={member.photoURL}
                        alt={member.name || "Member"}
                      />
                    ) : (
                      <AvatarFallback sportType={group.sport}>
                        {member.name
                          ? member.name.charAt(0).toUpperCase()
                          : "M"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-3 mt-auto" withBorder>
        {" "}
        {/* Added mt-auto to push to bottom */}
        <div className="flex w-full justify-between items-center">
          <Link href={`/app/groups/${group.id}`} passHref>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-500 hover:text-primary-600" // Ensure consistent link styling
              // Removed 'as="a"' and 'legacyBehavior' from Link as Button is a direct child
            >
              View Details
            </Button>
          </Link>
          {actionButton}
        </div>
      </CardFooter>
    </Card>
  );
}
