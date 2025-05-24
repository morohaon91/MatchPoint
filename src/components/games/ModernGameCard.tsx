import React, { useState } from "react";
import Link from "next/link";
import { Game, GameStatus, SportType } from "@/lib/types/models";
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
import { Timestamp as FirestoreTimestamp } from "firebase/firestore";
import Image from 'next/image';
import { joinGame } from "@/lib/games/gameService";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";

interface ModernGameCardProps {
  game: Game;
  onRegister?: (gameId: string) => void;
  onUnregister?: (gameId: string) => void;
  isRegistered?: boolean;
  isWaitlisted?: boolean;
  spotsLeft?: number;
  waitlistCount?: number;
  participantAvatars?: Array<{ id: string; photoURL?: string; name?: string }>;
  className?: string;
}

/**
 * ModernGameCard component displays a game card with modern UI
 */
export default function ModernGameCard({
  game,
  onRegister,
  onUnregister,
  isRegistered = false,
  isWaitlisted = false,
  spotsLeft,
  waitlistCount,
  participantAvatars = [],
  className = "",
}: ModernGameCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { currentUser } = useAuth();

  // Format date for display
  const formatGameDate = (timestamp: FirestoreTimestamp | Date | string): string => {
    try {
      let date: Date;
      
      if (timestamp instanceof FirestoreTimestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        console.error("Invalid timestamp format:", timestamp);
        return "Invalid date";
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date object:", date);
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Get status badge based on game status
  const getStatusBadge = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UPCOMING:
        return <Badge variant="primary">Upcoming</Badge>;
      case GameStatus.IN_PROGRESS:
        return (
          <Badge variant="warning" withDot>
            In Progress
          </Badge>
        );
      case GameStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case GameStatus.CANCELED:
        return <Badge variant="error">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleRegisterClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRegister = async () => {
    try {
      if (!currentUser?.uid) {
        toast.error("You must be logged in to join a game");
        return;
      }

      await joinGame(game.id, currentUser.uid);
      
      if (onRegister) {
        onRegister(game.id);
      }
      
      toast.success("You have successfully joined the game");
    } catch (error) {
      console.error("Error joining game:", error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message === 'Not authenticated') {
          toast.error("Please log in again to join the game");
          // Optionally trigger a re-authentication flow here
          return;
        }
        toast.error(error.message);
      } else {
        toast.error("Failed to join game");
      }
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
  };

  // Get registration status component
  const getRegistrationStatus = () => {
    if (
      game.status === GameStatus.CANCELED ||
      game.status === GameStatus.COMPLETED
    ) {
      return (
        <Link href={`/app/games/${game.id}`}>
          <Button variant="outline" size="sm" sportType={game.sport}>
            View Details
          </Button>
        </Link>
      );
    }

    if (isRegistered) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnregister && onUnregister(game.id)}
          className="text-error-500 border-error-500 hover:bg-error-50"
        >
          Cancel Registration
        </Button>
      );
    }

    if (isWaitlisted) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnregister && onUnregister(game.id)}
          className="text-warning-500 border-warning-500 hover:bg-warning-50"
        >
          Leave Waitlist
        </Button>
      );
    }

    if (spotsLeft !== undefined && spotsLeft > 0) {
      return (
        <Button
          variant="primary"
          size="sm"
          sportType={game.sport}
          onClick={handleRegisterClick}
        >
          Add Me to Game
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegisterClick}
      >
        Add Me to Game
      </Button>
    );
  };

  return (
    <Card
      variant="elevated"
      sportType={game.sport}
      isHoverable
      className={`overflow-hidden ${className}`}
    >
      {/* Game image */}
      {game.photoURL && (
        <div className="relative w-full h-32 overflow-hidden">
          <Image
            src={game.photoURL}
            alt={game.title}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as any).src =
                "https://via.placeholder.com/400x200?text=Game+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <Badge sportType={game.sport} size="sm">
              {game.sport}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{game.title}</CardTitle>
          {getStatusBadge(game.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Game details */}
        <div className="flex items-center text-sm text-neutral-600 mb-4">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatGameDate(game.scheduledTime)}</span>
        </div>

        {/* Location */}
        {game.location && (
          <div className="flex items-center text-sm text-neutral-600 mb-4">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{game.location}</span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-neutral-600">
            {game.participantIds.length} / {game.maxParticipants} participants
          </div>

          {/* Participant avatars */}
          {participantAvatars.length > 0 && (
            <AvatarGroup limit={3} size="xs" spacing="tight">
              {participantAvatars.map((participant) => (
                <Avatar key={participant.id} size="xs" sportType={game.sport}>
                  {participant.photoURL ? (
                    <AvatarImage
                      src={participant.photoURL}
                      alt={participant.name || "Participant"}
                    />
                  ) : (
                    <AvatarFallback sportType={game.sport}>
                      {participant.name
                        ? participant.name.charAt(0).toUpperCase()
                        : "P"}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </div>

        {/* Registration status */}
        {(isRegistered || isWaitlisted) && (
          <div className="mt-2">
            {isRegistered && (
              <Badge variant="success" size="sm">
                Registered
              </Badge>
            )}
            {isWaitlisted && (
              <Badge variant="warning" size="sm">
                Waitlisted
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0" withBorder>
        <div className="flex w-full justify-between items-center">
          {/* Game type badge */}
          <Badge variant="outline" size="sm">
            {game.isRecurring ? "Recurring" : "One-time"}
          </Badge>

          {/* Action button */}
          {getRegistrationStatus()}
        </div>
      </CardFooter>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Join Game</h3>
            <p className="mb-4">Are you sure you want to join &quot;{game.title}&quot;?</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" size="sm" onClick={handleCancelDialog}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" sportType={game.sport} onClick={handleConfirmRegister}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
