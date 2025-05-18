"use client";

import React, { useState, useMemo } from "react";
import { Game, User, GameStatus } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
// Removed unused Chevron icon imports as inline SVGs are used.
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

interface GamesCalendarWidgetProps {
  games: Game[]; // All games user is a participant in
  currentUser: User;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function GamesCalendarWidget({
  games,
  currentUser,
}: GamesCalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startingDayOffset = useMemo(() => {
    return getDay(startOfMonth(currentMonth));
  }, [currentMonth]);

  const gamesByDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    games.forEach((game) => {
      const dateStr = format(new Date(game.scheduledTime), "yyyy-MM-dd");
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)?.push(game);
    });
    return map;
  }, [games]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const getDayClassNames = (day: Date): string => {
    let classNames = "text-center py-2 text-sm ";
    const dateStr = format(day, "yyyy-MM-dd");
    const hasGame =
      gamesByDate.has(dateStr) &&
      (gamesByDate
        .get(dateStr)
        ?.some((g) => g.status === GameStatus.UPCOMING) ??
        false);

    if (isToday(day)) {
      classNames +=
        "bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-100 font-bold rounded-full ";
    } else {
      classNames += "text-neutral-700 dark:text-neutral-300 ";
    }

    if (hasGame) {
      classNames += "relative ";
    }
    return classNames;
  };

  const renderGameMarker = (day: Date): React.ReactNode => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayGames = gamesByDate.get(dateStr) || [];
    const upcomingGamesOnDay = dayGames.filter(
      (g) => g.status === GameStatus.UPCOMING,
    );

    if (upcomingGamesOnDay.length > 0) {
      // Simple dot marker for now. Could be sport-specific color.
      // Prioritize upcoming games for the marker.
      const primarySportOnDay = upcomingGamesOnDay[0].sport;
      let markerColor = "bg-primary-500"; // Default
      // Example: customize color by sport
      // if (primarySportOnDay === SportType.TENNIS) markerColor = 'bg-green-500';
      // if (primarySportOnDay === SportType.BASKETBALL) markerColor = 'bg-orange-500';

      return (
        <div
          className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 ${markerColor} rounded-full`}
        ></div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Games Calendar</CardTitle>
        <CardDescription>Your upcoming game days at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            {/* Using inline SVG for simplicity, replace with actual Icon component if available */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Button>
          <h3 className="font-semibold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-px border-t border-l border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-700">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="text-center py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-r border-b border-neutral-200 dark:border-neutral-700"
            >
              {dayName}
            </div>
          ))}
          {Array.from({ length: startingDayOffset }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-700"
            ></div>
          ))}
          {daysInMonth.map((day) => (
            <div
              key={day.toString()}
              className={`${getDayClassNames(day)} bg-white dark:bg-neutral-900 border-r border-b border-neutral-200 dark:border-neutral-700`}
            >
              <span>{format(day, "d")}</span>
              {renderGameMarker(day)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
