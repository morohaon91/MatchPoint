"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Game, User, GameStatus } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { intervalToDuration, Duration } from "date-fns"; // Removed unused imports, added Duration

interface NextGameWidgetProps {
  games: Game[]; // All games user is part of, sorted by scheduledTime ascending
  currentUser: User;
}

const formatDuration = (duration: Duration): string => {
  const parts = [];
  if (duration.days) parts.push(`${duration.days}d`);
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (duration.seconds) parts.push(`${duration.seconds}s`);
  return parts.join(" ") || "0s";
};

export default function NextGameWidget({
  games,
  currentUser,
}: NextGameWidgetProps) {
  const [nextGame, setNextGame] = useState<Game | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const upcomingGames = games
      .filter(
        (game) =>
          game.status === GameStatus.UPCOMING &&
          new Date(game.scheduledTime) > new Date(),
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime(),
      );

    const newCandidateGame = upcomingGames.length > 0 ? upcomingGames[0] : null;

    setNextGame((currentGame) => {
      // If the new candidate is null and current is also null, no change.
      if (!newCandidateGame && !currentGame) return currentGame;
      // If one is null and the other is not (i.e., game appeared or disappeared), it's a change.
      if (!newCandidateGame || !currentGame) return newCandidateGame;
      // If both are objects, compare by ID. If IDs differ, it's a change.
      if (newCandidateGame.id !== currentGame.id) return newCandidateGame;
      // If IDs are the same, we can also check if other critical data like scheduledTime changed.
      // This handles cases where the same game object might be updated.
      if (
        new Date(newCandidateGame.scheduledTime).getTime() !==
        new Date(currentGame.scheduledTime).getTime()
      ) {
        return newCandidateGame;
      }
      // Otherwise, no change needed, return the existing state to prevent re-render loop.
      return currentGame;
    });
  }, [games]); // Only depend on the 'games' prop.

  useEffect(() => {
    if (!nextGame) {
      setCountdown("");
      return;
    }

    const calculateCountdown = () => {
      const now = new Date();
      const gameTime = new Date(nextGame.scheduledTime);
      if (now >= gameTime) {
        setCountdown("Starting now!");
        return;
      }
      const duration = intervalToDuration({ start: now, end: gameTime });
      setCountdown(formatDuration(duration));
    };

    calculateCountdown(); // Initial calculation
    const timer = setInterval(calculateCountdown, 1000); // Update every second

    return () => clearInterval(timer);
  }, [nextGame]);

  if (!nextGame) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Next Game</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500">
            No upcoming games scheduled. Why not create one?
          </p>
          {/* TODO: Link to create game modal or page */}
          <Button variant="primary" className="mt-4">
            Create Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden"
      sportType={nextGame.sport.toLowerCase() as any}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Your Next Game</CardTitle>
          <Badge sportType={nextGame.sport.toLowerCase() as any} size="sm">
            {nextGame.sport}
          </Badge>
        </div>
        <CardDescription className="text-lg font-semibold text-primary-700 dark:text-primary-400">
          {nextGame.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextGame.location && (
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
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
            <span>{nextGame.location}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
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
          <span>
            {new Date(nextGame.scheduledTime).toLocaleString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="pt-2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            Countdown:
          </p>
          <p className="text-2xl font-bold text-primary dark:text-primary-300">
            {countdown}
          </p>
        </div>
      </CardContent>
      <CardFooter withBorder>
        <Link href={`/app/games/${nextGame.id}`} legacyBehavior>
          <Button
            variant="outline"
            sportType={nextGame.sport.toLowerCase() as any}
            className="w-full"
          >
            View Game Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
