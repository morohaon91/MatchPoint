'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GameParticipant, ParticipantStatus } from '@/lib/types/models';

interface ParticipantListProps {
  participants: GameParticipant[];
  isAdmin?: boolean;
  isOrganizer?: boolean;
  isLoading?: boolean;
  maxParticipants?: number;
  onStatusChange?: (participantId: string, newStatus: ParticipantStatus) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onInviteParticipant?: () => void;
}

/**
 * ParticipantList component displays and manages game participants
 */
export default function ParticipantList({
  participants = [],
  isAdmin = false,
  isOrganizer = false,
  isLoading = false,
  maxParticipants,
  onStatusChange,
  onRemoveParticipant,
  onInviteParticipant
}: ParticipantListProps) {
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  
  const canManage = isAdmin || isOrganizer;
  
  // Group participants by status
  const confirmedParticipants = participants.filter(
    p => p.status === ParticipantStatus.CONFIRMED
  );
  const waitlistedParticipants = participants.filter(
    p => p.status === ParticipantStatus.WAITLIST
  );
  const pendingParticipants = participants.filter(
    p => p.status === ParticipantStatus.DECLINED
  );
  
  const toggleParticipantExpand = (participantId: string) => {
    setExpandedParticipant(expandedParticipant === participantId ? null : participantId);
  };
  
  const renderParticipantItem = (participant: GameParticipant) => {
    return (
      <li key={participant.userId} className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 relative">
              {participant.photoURL ? (
                <Image
                  src={participant.photoURL}
                  alt={participant.displayName || 'User'}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {participant.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {participant.displayName || 'Unknown User'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              participant.status === ParticipantStatus.CONFIRMED 
                ? 'bg-green-100 text-green-800' 
                : participant.status === ParticipantStatus.WAITLIST
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {participant.status}
            </span>
            
            {canManage && (
              <button
                type="button"
                onClick={() => toggleParticipantExpand(participant.userId)}
                className="ml-2 text-gray-400 hover:text-gray-500"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {canManage && expandedParticipant === participant.userId && (
          <div className="mt-4 pl-14 flex flex-col sm:flex-row sm:items-center gap-3">
            {onStatusChange && (
              <div>
                <label htmlFor={`status-${participant.userId}`} className="sr-only">
                  Change status
                </label>
                <select
                  id={`status-${participant.userId}`}
                  value={participant.status}
                  onChange={(e) => onStatusChange(participant.userId, e.target.value as ParticipantStatus)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value={ParticipantStatus.CONFIRMED}>Confirmed</option>
                  <option value={ParticipantStatus.WAITLIST}>Waitlisted</option>
                  <option value={ParticipantStatus.DECLINED}>Declined</option>
                </select>
              </div>
            )}
            
            {onRemoveParticipant && (
              <button
                type="button"
                onClick={() => onRemoveParticipant(participant.userId)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
            )}
          </div>
        )}
      </li>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Participants ({confirmedParticipants.length}
          {maxParticipants ? ` / ${maxParticipants}` : ''})
        </h3>
        
        {canManage && onInviteParticipant && (
          <button
            type="button"
            onClick={onInviteParticipant}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Invite Player
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : participants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">No participants yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Confirmed participants */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Confirmed ({confirmedParticipants.length})
            </h4>
            {confirmedParticipants.length > 0 ? (
              <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-md">
                {confirmedParticipants.map(renderParticipantItem)}
              </ul>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <p className="text-gray-500 text-sm">No confirmed participants</p>
              </div>
            )}
          </div>
          
          {/* Waitlisted participants */}
          {waitlistedParticipants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Waitlist ({waitlistedParticipants.length})
              </h4>
              <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-md">
                {waitlistedParticipants.map(renderParticipantItem)}
              </ul>
            </div>
          )}
          
          {/* Pending participants */}
          {pendingParticipants.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Pending ({pendingParticipants.length})
              </h4>
              <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-md">
                {pendingParticipants.map(renderParticipantItem)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
