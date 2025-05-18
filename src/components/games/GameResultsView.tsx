'use client';

import React from 'react';
import { GameResult, Team } from '@/lib/types/models';
import { formatDate } from '@/lib/utils/dateUtils';

interface GameResultsViewProps {
  result: GameResult;
  teams: Team[];
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
  isOrganizer?: boolean;
}

/**
 * GameResultsView component displays game results
 */
export default function GameResultsView({
  result,
  teams,
  onEdit,
  onDelete,
  isAdmin = false,
  isOrganizer = false
}: GameResultsViewProps) {
  const canManage = isAdmin || isOrganizer;
  
  // Find the winning team
  const winningTeam = teams.find(team => team.id === result.winner);
  
  // Get team name by ID
  const getTeamName = (teamId: string): string => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">Game Results</h3>
          
          {canManage && (
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="text-gray-600 hover:text-gray-800"
                  aria-label="Edit results"
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
                  aria-label="Delete results"
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
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Final Score</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(result.scores).map(([teamId, score]) => (
                <div 
                  key={teamId} 
                  className={`p-3 rounded-md ${
                    result.winner === teamId 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {getTeamName(teamId)}
                      {result.winner === teamId && (
                        <span className="ml-2 text-green-600 text-sm">(Winner)</span>
                      )}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {result.notes && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600 text-sm whitespace-pre-line">{result.notes}</p>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium text-gray-700 mb-2">Attendance</h4>
            <p className="text-gray-600 text-sm">
              {result.attendees.length} players attended
            </p>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Recorded on {formatDate(result.recordedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
