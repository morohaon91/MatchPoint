'use client';

import React, { useState, useEffect } from 'react';
import { GameParticipant, Team, ParticipantStatus } from '@/lib/types/models';
import Image from 'next/image';

interface TeamBuilderProps {
  participants: GameParticipant[];
  initialTeams?: Team[];
  onSaveTeams?: (teams: Team[]) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * TeamBuilder component for creating balanced teams for games
 */
export default function TeamBuilder({
  participants = [],
  initialTeams = [],
  onSaveTeams,
  onCancel,
  isSubmitting = false
}: TeamBuilderProps) {
  const [teams, setTeams] = useState<Team[]>(initialTeams.length > 0 ? initialTeams : [
    { id: '1', name: 'Team 1', members: [] },
    { id: '2', name: 'Team 2', members: [] }
  ]);
  
  const [unassignedParticipants, setUnassignedParticipants] = useState<GameParticipant[]>([]);
  
  // Initialize unassigned participants
  useEffect(() => {
    // Filter confirmed participants
    const confirmedParticipants = participants.filter((p: GameParticipant) => p.status === ParticipantStatus.CONFIRMED);
    
    // If we have initial teams, find participants that are not in any team
    if (initialTeams.length > 0) {
      const assignedParticipantIds = new Set<string>();
      initialTeams.forEach(team => {
        team.members.forEach(member => {
          assignedParticipantIds.add(member.userId);
        });
      });
      
      setUnassignedParticipants(
        confirmedParticipants.filter((p: GameParticipant) => !assignedParticipantIds.has(p.userId))
      );
    } else {
      // If no initial teams, all confirmed participants are unassigned
      setUnassignedParticipants(confirmedParticipants);
    }
  }, [participants, initialTeams]);
  
  const addTeam = () => {
    const newTeamId = (teams.length + 1).toString();
    setTeams([...teams, { id: newTeamId, name: `Team ${newTeamId}`, members: [] }]);
  };
  
  const removeTeam = (teamId: string) => {
    // Move team members back to unassigned
    const teamToRemove = teams.find(t => t.id === teamId);
    if (teamToRemove) {
      setUnassignedParticipants([...unassignedParticipants, ...teamToRemove.members]);
    }
    
    // Remove the team
    setTeams(teams.filter((t: Team) => t.id !== teamId));
  };
  
  const updateTeamName = (teamId: string, newName: string) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, name: newName } : team
    ));
  };
  
  const assignToTeam = (participantId: string, teamId: string) => {
    // Find the participant
    const participant = unassignedParticipants.find((p: GameParticipant) => p.userId === participantId);
    if (!participant) return;
    
    // Remove from unassigned
    setUnassignedParticipants(unassignedParticipants.filter((p: GameParticipant) => p.userId !== participantId));
    
    // Add to team
    setTeams(teams.map((team: Team) => 
      team.id === teamId 
        ? { ...team, members: [...team.members, participant] } 
        : team
    ));
  };
  
  const removeFromTeam = (participantId: string, teamId: string) => {
    // Find the team
    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) return;
    
    // Find the participant in the team
    const participant = team.members.find((m: GameParticipant) => m.userId === participantId);
    if (!participant) return;
    
    // Remove from team
    setTeams(teams.map((t: Team) => 
      t.id === teamId 
        ? { ...t, members: t.members.filter((m: GameParticipant) => m.userId !== participantId) } 
        : t
    ));
    
    // Add to unassigned
    setUnassignedParticipants([...unassignedParticipants, participant]);
  };
  
  const autoAssignTeams = () => {
    // Combine all participants (unassigned and from teams)
    const allParticipants = [...unassignedParticipants];
    teams.forEach(team => {
      allParticipants.push(...team.members);
    });
    
    // Shuffle participants
    const shuffled = [...allParticipants].sort(() => 0.5 - Math.random());
    
    // Create empty teams
    const newTeams = teams.map(team => ({ ...team, members: [] as GameParticipant[] }));
    
    // Distribute participants evenly
    shuffled.forEach((participant, index) => {
      const teamIndex = index % newTeams.length;
      newTeams[teamIndex].members.push(participant);
    });
    
    // Update state
    setTeams(newTeams);
    setUnassignedParticipants([]);
  };
  
  const handleSave = () => {
    if (onSaveTeams) {
      onSaveTeams(teams);
    }
  };
  
  const renderParticipant = (participant: GameParticipant, inTeam: boolean = false, teamId?: string) => {
    return (
      <div 
        key={participant.userId} 
        className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm mb-2"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 relative">
            {participant.user?.photoURL ? (
              <Image
                src={participant.user.photoURL}
                alt={participant.user.name || 'User'}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium text-xs">
                  {participant.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {participant.user?.name || 'Unknown User'}
            </p>
          </div>
        </div>
        
        {inTeam && teamId ? (
          <button
            type="button"
            onClick={() => removeFromTeam(participant.userId, teamId)}
            className="text-red-600 hover:text-red-800"
            title="Remove from team"
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        ) : (
          <div className="flex space-x-1">
            {teams.map(team => (
              <button
                key={team.id}
                type="button"
                onClick={() => assignToTeam(participant.userId, team.id)}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200"
                title={`Assign to ${team.name}`}
              >
                {team.id}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Team Builder</h3>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={autoAssignTeams}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Auto-Assign
          </button>
          
          <button
            type="button"
            onClick={addTeam}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Add Team
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unassigned participants */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              Unassigned ({unassignedParticipants.length})
            </h4>
            <div className="space-y-2">
              {unassignedParticipants.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  All participants assigned
                </p>
              ) : (
                unassignedParticipants.map(participant => 
                  renderParticipant(participant)
                )
              )}
            </div>
          </div>
        </div>
        
        {/* Teams */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    className="text-sm font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0 p-0"
                  />
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">
                      {team.members.length} players
                    </span>
                    {teams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeam(team.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove team"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
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
                </div>
                <div className="space-y-2">
                  {team.members.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No players assigned
                    </p>
                  ) : (
                    team.members.map(member => 
                      renderParticipant(member, true, team.id)
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        {onSaveTeams && (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Teams'}
          </button>
        )}
      </div>
    </div>
  );
}
