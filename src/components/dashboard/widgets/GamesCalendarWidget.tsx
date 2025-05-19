"use client";

import React, { useState, useEffect } from "react";
import { Game, User, SportType } from "@/lib/types/models";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
// Import date-fns functions individually using named imports
import { format } from "date-fns/format";
import { startOfMonth } from "date-fns/startOfMonth";
import { endOfMonth } from "date-fns/endOfMonth";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import { isSameMonth } from "date-fns/isSameMonth";
import { isToday } from "date-fns/isToday";
import { parseISO } from "date-fns/parseISO";

interface GamesCalendarWidgetProps {
  games: Game[];
  currentUser: User;
}

export default function GamesCalendarWidget({
  games,
  currentUser,
}: GamesCalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [gamesMap, setGamesMap] = useState<Map<string, Game[]>>(new Map());

  // Generate calendar days for the current month
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  // Group games by date
  useEffect(() => {
    const map = new Map<string, Game[]>();
    
    games.forEach((game) => {
      const gameDate = typeof game.scheduledTime === 'string' 
        ? parseISO(game.scheduledTime) 
        : new Date(game.scheduledTime);
      
      const dateKey = format(gameDate, 'yyyy-MM-dd');
      
      if (map.has(dateKey)) {
        map.get(dateKey)?.push(game);
      } else {
        map.set(dateKey, [game]);
      }
    });
    
    setGamesMap(map);
  }, [games]);

  // Get games for a specific day
  const getGamesForDay = (day: Date): Game[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return gamesMap.get(dateKey) || [];
  };

  // Get sport color for a game
  const getSportColor = (sport: SportType): string => {
    switch (sport) {
      case SportType.TENNIS:
        return "bg-sport-tennis-primary";
      case SportType.BASKETBALL:
        return "bg-sport-basketball-primary";
      case SportType.SOCCER:
        return "bg-sport-soccer-primary";
      case SportType.VOLLEYBALL:
        return "bg-sport-volleyball-primary";
      case SportType.BASEBALL:
        return "bg-sport-baseball-primary";
      default:
        return "bg-primary-500";
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <Card variant="elevated" className="rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 group">
      <CardHeader className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-850 border-b border-neutral-200 dark:border-neutral-700 p-5">
        <CardTitle className="flex items-center text-lg font-semibold text-neutral-700 dark:text-neutral-200">
          {/* Calendar Icon from Heroicons */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2.5 text-primary-500 dark:text-primary-400">
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125V18a1.125 1.125 0 001.125 1.125h13.5A1.125 1.125 0 0019.875 18V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
          Games Calendar
        </CardTitle>
        <CardDescription className="ml-[34px] mt-1 text-neutral-500 dark:text-neutral-400 text-sm">
          Your upcoming games schedule at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 bg-white dark:bg-neutral-800/30">
        <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
          {/* Calendar header with month navigation */}
          <div className="flex items-center justify-between p-3.5 border-b border-neutral-200 dark:border-neutral-700">
            <button 
              onClick={goToPreviousMonth}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-600 dark:text-neutral-300">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button 
              onClick={goToNextMonth}
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-neutral-600 dark:text-neutral-300">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px p-1.5 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/50">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => ( // Shortened day names
              <div key={day} className="py-1.5">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700">
            {calendarDays.map((day, index) => {
              const dayGames = getGamesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              
              return (
                <div 
                  key={index}
                  className={`
                    relative p-1.5 h-16 flex flex-col items-center justify-start cursor-pointer
                    transition-colors duration-150 ease-in-out
                    ${isCurrentMonth ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200' : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-600'}
                    ${isTodayDate ? 'bg-primary-50 dark:bg-primary-700/30 ring-1 ring-primary-500 dark:ring-primary-400 z-10' : ''}
                    hover:bg-primary-50 dark:hover:bg-primary-700/40 
                  `}
                >
                  <span className={`text-xs font-medium ${isTodayDate ? 'text-primary-600 dark:text-primary-200' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Game indicators */}
                  {dayGames.length > 0 && (
                    <div className="flex mt-1.5 space-x-0.5 items-center">
                      {dayGames.length <= 2 ? ( // Show up to 2 distinct dots
                        dayGames.slice(0,2).map((game, i) => (
                          <div 
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${getSportColor(game.sport)} shadow-sm`}
                            title={game.title}
                          />
                        ))
                      ) : ( // Show 1 dot and a +N badge
                        <>
                          <div 
                            className={`w-1.5 h-1.5 rounded-full ${getSportColor(dayGames[0].sport)} shadow-sm`}
                            title={dayGames[0].title}
                          />
                          <Badge 
                            size="xs" // Reverted from "custom"
                            variant="primary" 
                            className="text-[9px] h-3.5 min-w-[14px] px-1 flex items-center justify-center leading-none !py-0" // Added !py-0 for compactness
                          >
                            +{dayGames.length - 1}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/70">
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
              {Object.values(SportType).map(sport => (
                <div key={sport} className="flex items-center text-xs">
                  <div className={`w-2.5 h-2.5 rounded-full mr-1.5 shadow-sm ${getSportColor(sport)}`}></div>
                  <span className="text-neutral-600 dark:text-neutral-300">{sport}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
