import React from "react";
import Link from "next/link";
import { Game, GameStatus } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { convertToDate, formatDate, isDateInFuture } from "@/lib/utils/dateUtils";

interface GameCardProps {
  game: Game;
  showGroupName?: boolean;
}

export default function GameCard({ game, showGroupName = false }: GameCardProps) {
  const isUpcoming = game.status === GameStatus.UPCOMING && isDateInFuture(game.scheduledTime);
  const formattedDate = formatDate(game.scheduledTime);

  return (
    <Link href={`/app/games/${game.id}`}>
      <Card
        variant="elevated"
        className={`rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
          !isUpcoming ? "opacity-60" : ""
        }`}
        sportType={game.sport.toLowerCase() as any}
      >
        <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">
              {game.title}
            </CardTitle>
            <Badge 
              sportType={game.sport.toLowerCase() as any}
              size="sm"
              className="animate-fade-in flex items-center gap-1.5 px-2.5 py-1 rounded-md"
            >
              {game.sport}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-4 bg-white dark:bg-neutral-800/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {game.location && (
              <div className="flex items-start text-sm text-neutral-700 dark:text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
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
                  <div className="font-semibold text-neutral-700 dark:text-neutral-200">{game.location}</div>
                </div>
              </div>
            )}
            <div className="flex items-start text-sm text-neutral-700 dark:text-neutral-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2.5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-0.5">Date & Time</div>
                <div className="font-semibold text-neutral-700 dark:text-neutral-200">{formattedDate}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {game.currentParticipants} / {game.maxParticipants || "∞"} players
              </div>
            </div>
            {showGroupName && game.groupId && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {game.groupName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 