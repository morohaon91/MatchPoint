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
      <Card variant="elevated" className="rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
        <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
          <CardTitle className="flex items-center text-lg font-semibold text-neutral-700 dark:text-neutral-200">
            {/* Updated Icon for "Your Next Game" - Calendar Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-400">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 001.125 1.125h13.5A1.125 1.125 0 0019.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
              <path d="M12 11.25a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 10.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM8.625 10.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM15.375 13.875a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM8.625 13.875a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM12 14.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
            </svg>
            Your Next Game
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white dark:bg-neutral-800/30">
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
            {/* Updated Empty State Icon - Calendar Plus */}
            <div className="w-16 h-16 mb-5 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-750 flex items-center justify-center shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neutral-400 dark:text-neutral-500">
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 001.125 1.125h13.5A1.125 1.125 0 0019.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25zM12 8.25a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0112 8.25z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 mb-2 text-md font-medium">
              No upcoming games scheduled.
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Ready to play? Create one now!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="elevated"
      className="rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 overflow-hidden group"
      sportType={nextGame.sport.toLowerCase() as any}
    >
      <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg font-semibold text-neutral-700 dark:text-neutral-200">
             {/* Updated Icon for "Your Next Game" - Calendar Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-400">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 001.125 1.125h13.5A1.125 1.125 0 0019.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
              <path d="M12 11.25a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM15.375 10.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM8.625 10.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM15.375 13.875a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM8.625 13.875a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM12 14.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
            </svg>
            Your Next Game
          </CardTitle>
          <Badge 
            sportType={nextGame.sport.toLowerCase() as any} 
            size="sm" // Consider 'md' for slightly more presence if needed
            className="animate-fade-in flex items-center gap-1.5 px-2.5 py-1 rounded-md" // Enhanced padding and rounding
          >
            <span className="flex items-center w-4 h-4"> {/* Explicit size for icon container */}
              {getSportIcon(nextGame.sport)}
            </span>
            <span className="text-xs font-medium">{nextGame.sport}</span>
          </Badge>
        </div>
        <CardDescription className="text-md font-medium text-neutral-600 dark:text-neutral-300 ml-[34px] mt-0.5"> {/* Adjusted margin and size */}
          {nextGame.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4 bg-white dark:bg-neutral-800/30"> {/* Adjusted padding and bg */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> {/* Reduced gap */}
          {nextGame.location && (
            <div className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-700/40 p-3 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5} // Thinner stroke
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-0.5">Location</div>
                <div className="font-semibold text-neutral-700 dark:text-neutral-200">{nextGame.location}</div>
              </div>
            </div>
          )}
          <div className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-100/70 dark:bg-neutral-700/40 p-3 rounded-lg shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5} // Thinner stroke
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-0.5">Date & Time</div>
              <div className="font-semibold text-neutral-700 dark:text-neutral-200">
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

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-700/30 dark:to-primary-800/40 rounded-lg p-4 mt-3 shadow-inner">
          <p className="text-xs text-primary-600 dark:text-primary-200 font-medium mb-1">
            STARTS IN:
          </p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-200 group-hover:scale-105 transition-transform duration-200 ease-out">
            {countdown}
          </p>
        </div>
      </CardContent>
      <CardFooter withBorder className="bg-neutral-50 dark:bg-neutral-800/50 px-5 py-3"> {/* Adjusted padding */}
        <Link href={`/app/games/${nextGame.id}`} legacyBehavior className="w-full">
          <Button
            variant="outline"
            sportType={nextGame.sport.toLowerCase() as any}
            className="w-full text-sm py-2.5 hover:bg-primary-50 dark:hover:bg-primary-700/30 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 ease-in-out group-hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2"> {/* Smaller icon */}
              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              <path fillRule="evenodd" d="M.664 10.593a1.05 1.05 0 010-.936C2.006 7.016 5.522 4.375 10 4.375c4.478 0 7.994 2.64 9.336 5.281a1.05 1.05 0 010 .938C17.994 13.984 14.478 16.625 10 16.625c-4.478 0-7.994-2.64-9.336-5.282a1.05 1.05 0 010-.936zM15 10a5 5 0 11-10 0 5 5 0 0110 0z" clipRule="evenodd" />
            </svg>
            View Game Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
