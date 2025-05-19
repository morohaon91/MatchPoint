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
import { getSportIcon } from "../SmartDashboard";

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
      <Card variant="elevated" className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
          <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
            </svg>
            Your Next Game
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No upcoming games scheduled. Why not create one?
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 italic">
              Use the "Quick Create Game" option in the sidebar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      sportType={nextGame.sport.toLowerCase() as any}
    >
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
            </svg>
            Your Next Game
          </CardTitle>
          <Badge 
            sportType={nextGame.sport.toLowerCase() as any} 
            size="sm"
            className="animate-fade-in flex items-center gap-1"
          >
            <span className="flex items-center">
              {getSportIcon(nextGame.sport)}
            </span>
            <span>{nextGame.sport}</span>
          </Badge>
        </div>
        <CardDescription className="text-lg font-semibold text-primary-700 dark:text-primary-400 ml-8">
          {nextGame.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextGame.location && (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3 text-primary-500"
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
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-500 font-medium mb-0.5">Location</div>
                <div className="font-medium">{nextGame.location}</div>
              </div>
            </div>
          )}
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-primary-500"
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
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500 font-medium mb-0.5">Date & Time</div>
              <div className="font-medium">
                {new Date(nextGame.scheduledTime).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mt-4">
          <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">
            Countdown:
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-300 animate-pulse-slow">
            {countdown}
          </p>
        </div>
      </CardContent>
      <CardFooter withBorder className="bg-neutral-50 dark:bg-neutral-800 px-6 py-4">
        <Link href={`/app/games/${nextGame.id}`} legacyBehavior className="w-full">
          <Button
            variant="outline"
            sportType={nextGame.sport.toLowerCase() as any}
            className="w-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
            </svg>
            View Game Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
