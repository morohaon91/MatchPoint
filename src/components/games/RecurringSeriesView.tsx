"use client";

import React, { useState } from "react";
import { RecurringSeries, Game } from "@/lib/types/models";
import { formatDate, formatTime } from "@/lib/utils/dateUtils";
import Link from "next/link";

interface RecurringSeriesViewProps {
  series: RecurringSeries;
  instances?: Game[];
  onEdit?: () => void;
  onDelete?: () => void;
  onGenerateInstances?: () => void;
  isAdmin?: boolean;
  isOrganizer?: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const FREQUENCY_MAP = {
  weekly: "Weekly",
  biweekly: "Every two weeks",
  monthly: "Monthly",
};

const formatTimeOrFallback = (timestamp?: string) =>
  timestamp ? formatTime(timestamp) : "Not specified";
const getDayName = (dayNumber?: number) =>
  dayNumber !== undefined ? DAYS[dayNumber] : "Any day";

const EditIcon = () => (
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
);

const DeleteIcon = () => (
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
);

const ManageButtons = ({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) => (
  <div className="flex space-x-2">
    {onEdit && (
      <button
        onClick={onEdit}
        className="text-gray-600 hover:text-gray-800"
        aria-label="Edit series"
      >
        <EditIcon />
      </button>
    )}
    {onDelete && (
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800"
        aria-label="Delete series"
      >
        <DeleteIcon />
      </button>
    )}
  </div>
);

const GameInstanceItem = ({ game }: { game: Game }) => (
  <li key={game.id} className="py-3">
    <Link
      href={`/app/groups/${game.groupId}/games/${game.id}`}
      className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-md"
    >
      <div>
        <p className="font-medium text-gray-900">{game.title}</p>
        <p className="text-sm text-gray-500">
          {formatDate(game.date)} at {formatTime(game.date)}
        </p>
      </div>
      <div className="text-sm text-gray-500">
        {game.currentParticipants} / {game.maxParticipants || "∞"} participants
      </div>
    </Link>
  </li>
);

export default function RecurringSeriesView({
  series,
  instances = [],
  onEdit,
  onDelete,
  onGenerateInstances,
  isAdmin = false,
  isOrganizer = false,
}: RecurringSeriesViewProps) {
  const [showInstances, setShowInstances] = useState(false);
  const canManage = isAdmin || isOrganizer;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {FREQUENCY_MAP[series.frequency]} on{" "}
              {getDayName(series.dayOfWeek)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatTimeOrFallback(series.timeOfDay)}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowInstances(!showInstances)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showInstances ? "Hide Instances" : "Show Instances"}
            </button>

            {canManage && <ManageButtons onEdit={onEdit} onDelete={onDelete} />}
          </div>
        </div>

        <div className="mt-2 text-sm">
          <div className="flex items-center text-gray-500">
            <span>Start date: {formatDate(series.startDate)}</span>
            {series.endDate && (
              <span className="ml-4">
                End date: {formatDate(series.endDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {showInstances && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Game Instances
            </h4>

            {canManage && onGenerateInstances && (
              <button
                type="button"
                onClick={onGenerateInstances}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate Instances
              </button>
            )}
          </div>

          {instances.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No game instances have been generated yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {instances.map((game) => (
                <GameInstanceItem key={game.id} game={game} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
