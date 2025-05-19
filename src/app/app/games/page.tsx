'use client';

import React, { useEffect, useState } from 'react';
import { Game, GameStatus, Group } from '@/lib/types/models';
import GameList from '@/components/games/GameList';
import { getGroupGames, getUserGroups } from '@/lib/services';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const groupId = searchParams.get('groupId');
  const status = searchParams.get('status') as GameStatus | null;
  
  // Load user's groups
  useEffect(() => {
    async function loadUserGroups() {
      if (!currentUser) return;
      
      try {
        setLoadingGroups(true);
        
        // Fetch groups from API
        const groupsResponse = await fetch('/api/groups?type=my', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          }
        });

        if (!groupsResponse.ok) {
          console.error('Error fetching groups:', await groupsResponse.text());
          setLoadingGroups(false);
          return;
        }

        const groupsData = await groupsResponse.json();
        const groups = groupsData.groups || [];
        setUserGroups(groups);
        
        // If no groupId is selected but user has groups, select the first one
        if (!groupId && groups.length > 0) {
          router.push(`/app/games?groupId=${groups[0].id}`);
        }
      } catch (err) {
        console.error('Error loading user groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    }
    
    loadUserGroups();
  }, [currentUser, router, groupId]);

  // Load games for selected group
  useEffect(() => {
    async function loadGames() {
      try {
        if (!groupId) {
          if (userGroups.length === 0 && !loadingGroups) {
            setError('No groups found. Please create or join a group first.');
          } else if (!loadingGroups) {
            setError('No group selected. Please select a group to view games.');
          }
          setLoading(false);
          return;
        }

        // Fetch games from API
        const queryParams = new URLSearchParams();
        if (status) {
          queryParams.append('status', status);
        }
        
        const gamesResponse = await fetch(`/api/games?groupId=${groupId}&${queryParams.toString()}`, {
          headers: currentUser ? {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`
          } : {}
        });

        if (!gamesResponse.ok) {
          console.error('Error fetching games:', await gamesResponse.text());
          setError('Failed to load games. Please try again later.');
          setLoading(false);
          return;
        }

        const gamesData = await gamesResponse.json();
        setGames(gamesData.games || []);
        setError(null);
      } catch (err) {
        console.error('Error loading games:', err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser || !groupId) {
      loadGames();
    } else {
      // If no user is logged in yet but we have a groupId, wait for auth to complete
      setLoading(true);
    }
  }, [groupId, status, userGroups, loadingGroups, currentUser]);

  const handleCreateGame = () => {
    if (groupId) {
      router.push(`/app/games/create?groupId=${groupId}`);
    } else {
      setError('Please select a group before creating a game.');
    }
  };
  
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupId = e.target.value;
    if (newGroupId) {
      router.push(`/app/games?groupId=${newGroupId}${status ? `&status=${status}` : ''}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Games</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Group selector */}
          <div className="w-full md:w-64">
            <select 
              className="select select-bordered w-full"
              value={groupId || ''}
              onChange={handleGroupChange}
              disabled={loadingGroups}
            >
              <option value="" disabled>Select a group</option>
              {userGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleCreateGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Create Game
          </button>
        </div>
      </div>

      {loading || loadingGroups ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          {error.includes('No groups found') && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/app/groups/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-2"
              >
                Create a Group
              </button>
              <button
                onClick={() => router.push('/app/groups')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Find Groups
              </button>
            </div>
          )}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No games found for this group.</p>
          <button
            onClick={handleCreateGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Create Your First Game
          </button>
        </div>
      ) : (
        <GameList games={games} />
      )}
    </div>
  );
}
