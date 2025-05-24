"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Game, ParticipantStatus } from "@/lib/types/models";
import { isDateInPast, formatDate, formatTime } from "@/lib/utils/dateUtils";
import ModernGameCard from "./ModernGameCard";

interface GameListProps {
  games: Game[];
  isLoading?: boolean;
  userParticipantStatus?: Record<string, ParticipantStatus | null>;
  isAdmin?: boolean;
  isOrganizer?: boolean;
  onEditGame?: (game: Game) => void;
  onDeleteGame?: (game: Game) => void;
  onJoinGame?: (game: Game) => void;
  onLeaveGame?: (game: Game) => void;
  emptyMessage?: string;
}

export default function GameList({
  games = [],
  isLoading = false,
  userParticipantStatus = {},
  isAdmin = false,
  isOrganizer = false,
  onEditGame,
  onDeleteGame,
  onJoinGame,
  onLeaveGame,
  emptyMessage = "No games found",
}: GameListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"listView" | "calendar">("listView");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "title">(
    "date-asc"
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    let result = [...games];

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "upcoming") {
        result = result.filter((game) => !isDateInPast(game.scheduledTime));
      } else if (statusFilter === "past") {
        result = result.filter((game) => isDateInPast(game.scheduledTime));
      } else if (statusFilter === "participating") {
        result = result.filter(
          (game) =>
            userParticipantStatus[game.id] === ParticipantStatus.CONFIRMED
        );
      } else if (statusFilter === "waitlisted") {
        result = result.filter(
          (game) =>
            userParticipantStatus[game.id] === ParticipantStatus.WAITLIST
        );
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(term) ||
          (game.description && game.description.toLowerCase().includes(term)) ||
          (game.location && game.location.toLowerCase().includes(term))
      );
    }

    // Apply sorting - using a helper to convert timestamps safely
    const getTimestamp = (scheduledTime: any): number => {
      try {
        return new Date(scheduledTime).getTime();
      } catch (e) {
        return 0;
      }
    };

    if (sortBy === "date-asc") {
      result.sort(
        (a, b) => getTimestamp(a.scheduledTime) - getTimestamp(b.scheduledTime)
      );
    } else if (sortBy === "date-desc") {
      result.sort(
        (a, b) => getTimestamp(b.scheduledTime) - getTimestamp(a.scheduledTime)
      );
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [games, statusFilter, searchTerm, userParticipantStatus, sortBy]);

  // Group games by date for calendar view
  const gamesByDate = useMemo(() => {
    const result: Record<string, Game[]> = {};
    if (viewMode === "calendar") {
      filteredGames.forEach((game) => {
        const dateKey = formatDate(game.scheduledTime);
        if (dateKey) {
          if (!result[dateKey]) {
            result[dateKey] = [];
          }
          result[dateKey].push(game);
        }
      });
    }
    return result;
  }, [filteredGames, viewMode]);

  // These functions from lib/utils/dateUtils handle the timestamp
  // Already imported at the top of the file

  const handleJoinGameClick = (game: Game) => {
    setSelectedGame(game);
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = () => {
    if (selectedGame && onJoinGame) {
      onJoinGame(selectedGame);
    }
    setShowConfirmDialog(false);
    setSelectedGame(null);
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
    setSelectedGame(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="w-full sm:w-64">
          <label htmlFor="search" className="sr-only">
            Search games
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search games"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="w-full sm:w-auto">
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              name="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Games</option>
              <option value="upcoming">Upcoming Games</option>
              <option value="past">Past Games</option>
              <option value="participating">I&apos;m Participating</option>
              <option value="waitlisted">I&apos;m Waitlisted</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <select
              id="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date-asc" | "date-desc" | "title")
              }
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="date-asc">Date (Earliest First)</option>
              <option value="date-desc">Date (Latest First)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <div className="flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode("listView")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === "listView"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline-block mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline-block mr-1"
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
              Calendar
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : viewMode === "listView" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <ModernGameCard
              isRegistered={
                userParticipantStatus[game.id] === ParticipantStatus.CONFIRMED
              }
              isWaitlisted={
                userParticipantStatus[game.id] === ParticipantStatus.WAITLIST
              }
              onRegister={onJoinGame ? () => onJoinGame(game) : undefined}
              onUnregister={onLeaveGame ? () => onLeaveGame(game) : undefined}
              key={game.id}
              game={game}
              waitlistCount={game.waitlistIds?.length ?? 0}
              spotsLeft={game.maxParticipants ? game.maxParticipants - (game.currentParticipants || 0) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h3 className="text-lg font-medium text-blue-800">Calendar View</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.keys(gamesByDate)
              .sort()
              .map((dateKey) => (
                <div key={dateKey} className="p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-600"
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
                    {dateKey}
                  </h4>
                  <div className="space-y-3 pl-7">
                    {gamesByDate[dateKey].map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {game.title}
                          </h5>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatTime(game.scheduledTime)}
                            <span className="mx-2">•</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-gray-400"
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
                            {game.location}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/app/games/${game.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Details
                          </Link>
                          {!isDateInPast(game.scheduledTime) &&
                            !userParticipantStatus[game.id] &&
                            onJoinGame && (
                              <button
                                onClick={() => handleJoinGameClick(game)}
                                className="inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium"
                              >
                                Add Me to Game
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Join Game</h3>
            <p className="mb-4">Are you sure you want to join &quot;{selectedGame.title}&quot;?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCancelDialog}
                className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmJoin}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
