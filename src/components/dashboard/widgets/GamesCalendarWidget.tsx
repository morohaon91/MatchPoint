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
// Import date-fns functions individually to avoid compatibility issues
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import isSameMonth from "date-fns/isSameMonth";
import isToday from "date-fns/isToday";
import parseISO from "date-fns/parseISO";

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
    <Card variant="elevated" className="shadow-lg border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-white dark:from-neutral-800 dark:to-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
        <CardTitle className="flex items-center text-xl text-primary-700 dark:text-primary-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-primary-500">
            <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
          </svg>
          Games Calendar
        </CardTitle>
        <CardDescription className="ml-8 text-neutral-500 dark:text-neutral-400">
          Your upcoming games schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
          {/* Calendar header with month navigation */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-700">
            <button 
              onClick={goToPreviousMonth}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-500">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button 
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-neutral-500">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 p-2 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {calendarDays.map((day, index) => {
              const dayGames = getGamesForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              
              return (
                <div 
                  key={index}
                  className={`
                    relative p-2 h-14 rounded-md flex flex-col items-center justify-start
                    ${isCurrentMonth ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400 dark:text-neutral-600'}
                    ${isTodayDate ? 'bg-primary-50 dark:bg-primary-900/20 font-bold border border-primary-200 dark:border-primary-800' : ''}
                    hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
                  `}
                >
                  <span className={`text-sm ${isTodayDate ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Game indicators */}
                  {dayGames.length > 0 && (
                    <div className="flex mt-1 space-x-1">
                      {dayGames.length <= 3 ? (
                        dayGames.map((game, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full ${getSportColor(game.sport)}`}
                            title={game.title}
                          />
                        ))
                      ) : (
                        <>
                          {dayGames.slice(0, 2).map((game, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${getSportColor(game.sport)}`}
                              title={game.title}
                            />
                          ))}
                          <Badge size="xs" variant="primary" className="text-[10px] h-4 min-w-4 flex items-center justify-center">
                            +{dayGames.length - 2}
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
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 flex flex-wrap gap-3 justify-center">
            {Object.values(SportType).map(sport => (
              <div key={sport} className="flex items-center text-xs">
                <div className={`w-3 h-3 rounded-full mr-1 ${getSportColor(sport)}`}></div>
                <span className="text-neutral-600 dark:text-neutral-400">{sport}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
