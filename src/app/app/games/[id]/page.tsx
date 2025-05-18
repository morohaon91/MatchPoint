'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game, GameParticipant, GameStatus, ParticipantStatus } from '@/lib/types/models';
import { getGameParticipants, updateGameParticipantStatus, removeGameParticipant } from '@/lib/services';
import { useAuth } from '@/lib/context/AuthContext';
import ParticipantList from '@/components/games/ParticipantList';
import { formatDate } from '@/lib/utils/dateUtils';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  
  const { currentUser } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGameDetails() {
      try {
        if (!gameId) {
          setError('Game ID is missing');
          setLoading(false);
          return;
        }

        // Fetch game data from API
        const gameResponse = await fetch(`/api/games/${gameId}`, {
          headers: currentUser ? {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          } : {}
        });

        if (!gameResponse.ok) {
          if (gameResponse.status === 404) {
            setError('Game not found');
          } else {
            console.error('Error fetching game:', await gameResponse.text());
            setError('Failed to load game details. Please try again later.');
          }
          setLoading(false);
          return;
        }

        const gameData = await gameResponse.json();
        const participantsData = await getGameParticipants(gameId);

        setGame(gameData.game);
        setParticipants(participantsData);
        setError(null);
      } catch (err) {
        console.error('Error loading game details:', err);
        setError('Failed to load game details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser || !gameId) {
      loadGameDetails();
    } else {
      // If no user is logged in yet but we have a gameId, wait for auth to complete
      setLoading(true);
    }
  }, [gameId, currentUser]);

  const handleEditGame = () => {
    if (game) {
      router.push(`/app/games/edit/${gameId}?groupId=${game.groupId}`);
    }
  };

  const handleBackToGames = () => {
    if (game) {
      router.push(`/app/games?groupId=${game.groupId}`);
    } else {
      router.push('/app/games');
    }
  };

  const getStatusBadgeClass = (status: GameStatus) => {
    switch (status) {
      case GameStatus.UPCOMING:
        return 'bg-blue-100 text-blue-800';
      case GameStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800';
      case GameStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case GameStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Game not found'}</p>
        </div>
        <button
          onClick={() => router.push('/app/games')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleBackToGames}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Games
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(game.status)}`}>
                  {game.status}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">
                  {formatDate(game.date)}
                </span>
              </div>
            </div>
            <button
              onClick={handleEditGame}
              className="text-blue-600 hover:text-blue-800"
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
          </div>

          {game.description && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{game.description}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              <div className="mt-2 space-y-2">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
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
                  <span className="text-gray-600">{game.location}</span>
                </div>
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
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
                  <span className="text-gray-600">
                    {game.currentParticipants} / {game.maxParticipants} participants
                  </span>
                </div>
                {game.isRecurring && (
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2"
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
                    <span className="text-gray-600">Recurring event</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
          <div className="mt-4">
            <ParticipantList 
              participants={participants} 
              maxParticipants={game.maxParticipants}
              isAdmin={true} // For testing purposes, we'll enable admin controls
              onStatusChange={async (userId: string, status: ParticipantStatus) => {
                try {
                  // Update participant status via API
                  const response = await fetch(`/api/games/${gameId}/participants`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${await currentUser?.getIdToken()}`
                    },
                    body: JSON.stringify({ participantId: userId, status })
                  });

                  if (!response.ok) {
                    throw new Error(`Failed to update status: ${await response.text()}`);
                  }

                  // Refresh participants list
                  const participantsResponse = await fetch(`/api/games/${gameId}/participants`, {
                    headers: {
                      'Authorization': `Bearer ${await currentUser?.getIdToken()}`
                    }
                  });

                  if (participantsResponse.ok) {
                    const data = await participantsResponse.json();
                    setParticipants(data.participants || []);
                  }
                } catch (err) {
                  console.error('Error updating participant status:', err);
                  setError('Failed to update participant status');
                }
              }}
              onRemoveParticipant={async (userId: string) => {
                try {
                  // Remove participant via API
                  const response = await fetch(`/api/games/${gameId}/participants?participantId=${userId}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${await currentUser?.getIdToken()}`
                    }
                  });

                  if (!response.ok) {
                    throw new Error(`Failed to remove participant: ${await response.text()}`);
                  }

                  // Refresh participants list
                  const participantsResponse = await fetch(`/api/games/${gameId}/participants`, {
                    headers: {
                      'Authorization': `Bearer ${await currentUser?.getIdToken()}`
                    }
                  });

                  if (participantsResponse.ok) {
                    const data = await participantsResponse.json();
                    setParticipants(data.participants || []);
                  }
                } catch (err) {
                  console.error('Error removing participant:', err);
                  setError('Failed to remove participant');
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
