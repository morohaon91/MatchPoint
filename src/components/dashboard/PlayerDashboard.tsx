import React, { useState } from "react";
import Link from "next/link";
import {
  Game,
  GameStatus,
  SportType,
  ParticipantStatus,
} from "@/lib/types/models";
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

// Extended Game interface with additional UI-related properties
export interface GameWithStatus extends Game {
  participantStatus?: "registered" | "waitlisted" | "none";
  userStatus?: ParticipantStatus; // For backward compatibility with mock data
  participantAvatars?: Array<{ id: string; photoURL?: string; name?: string }>;
  spotsLeft?: number;
  waitlistCount?: number;
  // Additional properties from mock data
  date?: Date;
  currentParticipants?: number;
  groupName?: string;
  groupSport?: SportType;
  participantCount?: number;
}

interface PlayerDashboardProps {
  upcomingGames: GameWithStatus[];
  pastGames: GameWithStatus[];
  recommendedGames?: GameWithStatus[];
  userName?: string;
  userPhotoURL?: string;
  onRegisterGame?: (gameId: string) => void;
  onUnregisterGame?: (gameId: string) => void;
  className?: string;
}

/**
 * PlayerDashboard component displays a player's dashboard with upcoming, past, and recommended games
 */
export default function PlayerDashboard({
  upcomingGames = [],
  pastGames = [],
  recommendedGames = [],
  onRegisterGame,
  onUnregisterGame,
  className = "",
}: PlayerDashboardProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "recommended"
  >("upcoming");

  // Format date for display
  const formatGameDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
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

  // Get participant status badge
  const getParticipantStatusBadge = (game: GameWithStatus) => {
    // Handle both participantStatus and userStatus (from mock data)
    if (game.participantStatus) {
      switch (game.participantStatus) {
        case "registered":
          return (
            <Badge variant="success" size="sm">
              Registered
            </Badge>
          );
        case "waitlisted":
          return (
            <Badge variant="warning" size="sm">
              Waitlisted
            </Badge>
          );
        default:
          return null;
      }
    } else if (game.userStatus) {
      switch (game.userStatus) {
        case ParticipantStatus.CONFIRMED:
          return (
            <Badge variant="success" size="sm">
              Registered
            </Badge>
          );
        case ParticipantStatus.WAITLIST:
          return (
            <Badge variant="warning" size="sm">
              Waitlisted
            </Badge>
          );
        default:
          return null;
      }
    }
    return null;
  };

  // Sort games by date
  const sortGamesByDate = (games: GameWithStatus[]): GameWithStatus[] => {
    return [...games].sort((a, b) => {
      const dateA = new Date(a.scheduledTime).getTime();
      const dateB = new Date(b.scheduledTime).getTime();

      if (activeTab === "past") {
        return dateB - dateA; // Most recent first for past games
      }

      return dateA - dateB; // Soonest first for upcoming and recommended
    });
  };

  // Get games to display based on active tab
  const getGamesToDisplay = (): GameWithStatus[] => {
    switch (activeTab) {
      case "upcoming":
        return sortGamesByDate(upcomingGames);
      case "past":
        return sortGamesByDate(pastGames);
      case "recommended":
        return sortGamesByDate(recommendedGames);
      default:
        return [];
    }
  };

  // Get registration status component
  const getRegistrationStatus = (game: GameWithStatus) => {
    if (
      game.status === GameStatus.CANCELED ||
      game.status === GameStatus.COMPLETED
    ) {
      return (
        <Link href={`/app/games/${game.id}`}>
          <Button
            variant="outline"
            size="sm"
            sportType={game.sport.toLowerCase() as any}
          >
            View Details
          </Button>
        </Link>
      );
    }

    if (game.participantStatus === "registered") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnregisterGame && onUnregisterGame(game.id)}
          className="text-error-500 border-error-500 hover:bg-error-50"
        >
          Cancel Registration
        </Button>
      );
    }

    if (game.participantStatus === "waitlisted") {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnregisterGame && onUnregisterGame(game.id)}
          className="text-warning-500 border-warning-500 hover:bg-warning-50"
        >
          Leave Waitlist
        </Button>
      );
    }

    if (game.spotsLeft && game.spotsLeft > 0) {
      return (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            sportType={game.sport.toLowerCase() as any}
            onClick={() => onRegisterGame && onRegisterGame(game.id)}
          >
            Add Me to Game
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
          >
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRegisterGame && onRegisterGame(game.id)}
        >
          Add Me to Game
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}}
        >
          Cancel
        </Button>
      </div>
    );
  };

  // Render game card
  const renderGameCard = (game: GameWithStatus) => (
    <Card
      key={game.id}
      variant="elevated"
      sportType={game.sport.toLowerCase() as any}
      isHoverable
      className="overflow-hidden"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{game.title}</CardTitle>
          {getStatusBadge(game.status)}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Game details */}
        <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
          <div className="flex items-center">
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
            <span>{formatGameDate(new Date(game.scheduledTime))}</span>
          </div>

          <Badge sportType={game.sport.toLowerCase() as any} size="sm">
            {game.sport}
          </Badge>
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
          {game.participantAvatars && game.participantAvatars.length > 0 && (
            <AvatarGroup limit={3} size="xs" spacing="tight">
              {game.participantAvatars.map((participant) => (
                <Avatar
                  key={participant.id}
                  size="xs"
                  sportType={game.sport.toLowerCase() as any}
                >
                  {participant.photoURL ? (
                    <AvatarImage
                      src={participant.photoURL}
                      alt={participant.name || "Participant"}
                    />
                  ) : (
                    <AvatarFallback sportType={game.sport.toLowerCase() as any}>
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

        {/* Participant status */}
        {(game.participantStatus || game.userStatus) && (
          <div className="mt-2">{getParticipantStatusBadge(game)}</div>
        )}
      </CardContent>

      <CardFooter className="pt-0" withBorder>
        <div className="flex w-full justify-between items-center">
          {/* Game type badge */}
          <Badge variant="outline" size="sm">
            {game.isRecurring ? "Recurring" : "One-time"}
          </Badge>

          {/* Action button */}
          {getRegistrationStatus(game)}
        </div>
      </CardFooter>
    </Card>
  );

  // Tab button component
  const TabButton = ({
    tab,
    label,
    count,
  }: {
    tab: "upcoming" | "past" | "recommended";
    label: string;
    count: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? "bg-primary text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {label} {count > 0 && <span className="ml-1 font-normal">({count})</span>}
    </button>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">My Games</h2>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <TabButton
            tab="upcoming"
            label="Upcoming"
            count={upcomingGames.length}
          />
          <TabButton tab="past" label="Past" count={pastGames.length} />
          <TabButton
            tab="recommended"
            label="Recommended"
            count={recommendedGames.length}
          />
        </div>
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getGamesToDisplay().map(renderGameCard)}
      </div>

      {/* Empty state */}
      {getGamesToDisplay().length === 0 && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-neutral-400"
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
            </div>
            <h3 className="text-lg font-medium">No games found</h3>
            <p className="text-neutral-500 max-w-md">
              {activeTab === "upcoming" &&
                "You don't have any upcoming games. Join a game or create your own!"}
              {activeTab === "past" &&
                "You haven't participated in any games yet."}
              {activeTab === "recommended" &&
                "We don't have any recommended games for you at the moment."}
            </p>
            <Link href="/app/games">
              <Button variant="primary" className="mt-2">
                Browse Games
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
