"use client";

import React from "react";
import Link from "next/link";
import { Game, ParticipantStatus, SportType } from "@/lib/types/models";
import { formatDate, formatTime } from "@/lib/utils/dateUtils";

interface GameCardProps {
  game: Game;
  isAdmin?: boolean;
  isOrganizer?: boolean;
  userParticipantStatus?: ParticipantStatus | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
}

/**
 * GameCard component displays a game's information in a card format
 */
export default function GameCard({
  game,
  isAdmin = false,
  isOrganizer = false,
  userParticipantStatus = null,
  onEdit,
  onDelete,
  onJoin,
  onLeave,
}: GameCardProps) {
  const canManage = isAdmin || isOrganizer;
  const isParticipant = userParticipantStatus !== null;
  const isConfirmed = userParticipantStatus === ParticipantStatus.CONFIRMED;
  const isWaitlisted = userParticipantStatus === ParticipantStatus.WAITLIST;

  // Calculate if the game is in the past
  const isPastGame = new Date(game.scheduledTime) < new Date();

  // Calculate if the game is full
  const confirmedCount = game.participantIds?.length || 0;
  const isFull = game.maxParticipants && confirmedCount >= game.maxParticipants;

  // Format date and time
  const formattedDate = formatDate(game.scheduledTime);
  const formattedTime = formatTime(game.scheduledTime);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {game.title}
          </h3>
          <div>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                isPastGame
                  ? "bg-gray-100 text-gray-800"
                  : isFull
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
              } shadow-sm`}
            >
              {isPastGame ? "Past" : isFull ? "Full" : "Open"}
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500 space-y-2">
          <div className="flex items-center">
            <div className="bg-blue-50 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
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
            <span className="font-medium text-gray-700">{formattedDate}</span>
          </div>

          <div className="flex items-center">
            <div className="bg-purple-50 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-600"
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
            </div>
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center">
            <div className="bg-green-50 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
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
            </div>
            <span className="line-clamp-1">{game.location}</span>
          </div>

          <div className="flex items-center">
            <div className="bg-amber-50 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="flex items-center">
              <span>
                {confirmedCount} / {game.maxParticipants || "∞"} participants
              </span>
              {isFull && (
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  Full
                </span>
              )}
            </div>
          </div>
        </div>

        {game.description && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2 border-t pt-3 border-gray-100">
            {game.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-between items-center pt-3 border-t border-gray-100">
          <Link
            href={`/app/games/${game.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
          >
            View Details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <div className="flex space-x-2 mt-2 sm:mt-0">
            {!isPastGame && !isParticipant && onJoin && (
              <button
                onClick={onJoin}
                className={`inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isFull
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {isFull ? (
                  <>
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Join Waitlist
                  </>
                ) : (
                  <>
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Join Game
                  </>
                )}
              </button>
            )}

            {isParticipant && onLeave && (
              <button
                onClick={onLeave}
                className="inline-flex items-center px-4 py-1.5 rounded-md bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium transition-colors"
              >
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
                    d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-4 4m0 0l-4-4m4 4V3"
                  />
                </svg>
                {isWaitlisted ? "Leave Waitlist" : "Leave Game"}
              </button>
            )}

            {canManage && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Edit game"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete game"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
