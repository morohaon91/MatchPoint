'use client';

import React, { useState, useEffect } from 'react';
import { GameResult, Team, GameParticipant, ParticipantStatus } from '@/lib/types/models';

interface GameResultsFormProps {
  gameId: string;
  teams: Team[];
  participants: GameParticipant[];
  initialData?: Partial<GameResult>;
  onSubmit: (data: Partial<GameResult>) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * GameResultsForm component for recording game results
 */
export default function GameResultsForm({
  gameId,
  teams,
  participants,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false
}: GameResultsFormProps) {
  const [formData, setFormData] = useState<Partial<GameResult>>({
    gameId,
    scores: {},
    attendees: [],
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize scores for each team
  useEffect(() => {
    if (teams.length > 0 && (!formData.scores || Object.keys(formData.scores).length === 0)) {
      const initialScores: Record<string, number> = {};
      teams.forEach(team => {
        initialScores[team.id] = 0;
      });
      
      setFormData(prev => ({
        ...prev,
        scores: initialScores
      }));
    }
  }, [teams, formData.scores]);
  
  // Initialize attendees with confirmed participants
  useEffect(() => {
    if (participants.length > 0 && (!formData.attendees || formData.attendees.length === 0)) {
      const confirmedParticipants = participants
        .filter(p => p.status === ParticipantStatus.CONFIRMED)
        .map(p => p.userId);
      
      setFormData(prev => ({
        ...prev,
        attendees: confirmedParticipants
      }));
    }
  }, [participants, formData.attendees]);
  
  const handleScoreChange = (teamId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [teamId]: score
      }
    }));
  };
  
  const handleAttendeeToggle = (userId: string) => {
    setFormData(prev => {
      const attendees = prev.attendees || [];
      
      if (attendees.includes(userId)) {
        return {
          ...prev,
          attendees: attendees.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          attendees: [...attendees, userId]
        };
      }
    });
  };
  
  const handleWinnerChange = (teamId: string) => {
    setFormData(prev => ({
      ...prev,
      winner: teamId
    }));
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.scores || Object.keys(formData.scores).length === 0) {
      newErrors.scores = 'Scores are required';
    }
    
    if (!formData.attendees || formData.attendees.length === 0) {
      newErrors.attendees = 'At least one attendee is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Record Game Results</h3>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Team Scores</h4>
          
          {teams.length === 0 ? (
            <p className="text-gray-500 text-sm">No teams have been created for this game.</p>
          ) : (
            <div className="space-y-4">
              {teams.map(team => (
                <div key={team.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`winner-${team.id}`}
                      name="winner"
                      checked={formData.winner === team.id}
                      onChange={() => handleWinnerChange(team.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`winner-${team.id}`} className="ml-2 text-sm font-medium text-gray-700">
                      {team.name} (Winner)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <label htmlFor={`score-${team.id}`} className="sr-only">
                      Score for {team.name}
                    </label>
                    <input
                      type="number"
                      id={`score-${team.id}`}
                      value={formData.scores?.[team.id] || 0}
                      onChange={(e) => handleScoreChange(team.id, parseInt(e.target.value) || 0)}
                      min="0"
                      className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errors.scores && (
            <p className="mt-2 text-sm text-red-600">{errors.scores}</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Attendance</h4>
          
          {participants.length === 0 ? (
            <p className="text-gray-500 text-sm">No participants for this game.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {participants.map(participant => (
                <div key={participant.userId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`attendee-${participant.userId}`}
                    checked={formData.attendees?.includes(participant.userId) || false}
                    onChange={() => handleAttendeeToggle(participant.userId)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`attendee-${participant.userId}`} className="ml-2 text-sm text-gray-700">
                    {participant.user?.name || 'Unknown User'}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {errors.attendees && (
            <p className="mt-2 text-sm text-red-600">{errors.attendees}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={handleNotesChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any notes about the game"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
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
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData.gameId ? 'Update Results' : 'Record Results'}
        </button>
      </div>
    </form>
  );
}
