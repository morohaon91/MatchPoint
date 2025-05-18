import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { SportType } from "@/lib/types/models";

interface Player {
  id: string;
  name: string;
  photoURL?: string;
  skill?: number;
  position?: string;
  isSelected?: boolean;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  color?: string;
}

interface ModernTeamBuilderProps {
  players: Player[];
  initialTeams?: Team[];
  maxTeams?: number;
  sport: SportType;
  onTeamsGenerated?: (teams: Team[]) => void;
  onSaveTeams?: (teams: Team[]) => void;
  className?: string;
}

/**
 * ModernTeamBuilder component for creating balanced teams
 */
export default function ModernTeamBuilder({
  players,
  initialTeams = [],
  maxTeams = 2,
  sport,
  onTeamsGenerated,
  onSaveTeams,
  className = "",
}: ModernTeamBuilderProps) {
  // State for teams
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  // State for available players (not assigned to teams)
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  // State for team generation method
  const [generationMethod, setGenerationMethod] = useState<
    "random" | "balanced"
  >("balanced");
  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // Initialize available players
  useEffect(() => {
    if (initialTeams.length === 0) {
      // If no initial teams, all players are available
      setAvailablePlayers(players);
    } else {
      // If initial teams exist, filter out players already in teams
      const teamPlayerIds = initialTeams.flatMap((team) =>
        team.players.map((player) => player.id),
      );
      setAvailablePlayers(
        players.filter((player) => !teamPlayerIds.includes(player.id)),
      );
    }
  }, [players, initialTeams]);

  // Generate team colors based on sport
  const getTeamColors = (index: number): string => {
    const sportColors = {
      [SportType.TENNIS]: [
        "bg-sport-tennis-primary/10",
        "bg-sport-tennis-secondary/10",
      ],
      [SportType.BASKETBALL]: [
        "bg-sport-basketball-primary/10",
        "bg-sport-basketball-secondary/10",
      ],
      [SportType.SOCCER]: [
        "bg-sport-soccer-primary/10",
        "bg-sport-soccer-secondary/10",
      ],
      [SportType.VOLLEYBALL]: [
        "bg-sport-volleyball-primary/10",
        "bg-sport-volleyball-secondary/10",
      ],
      [SportType.BASEBALL]: [
        "bg-sport-baseball-primary/10",
        "bg-sport-baseball-secondary/10",
      ],
    };

    const colors = sportColors[sport] || ["bg-primary/10", "bg-secondary/10"];
    return colors[index % colors.length];
  };

  // Generate team border colors based on sport
  const getTeamBorderColors = (index: number): string => {
    const sportColors = {
      [SportType.TENNIS]: [
        "border-sport-tennis-primary",
        "border-sport-tennis-secondary",
      ],
      [SportType.BASKETBALL]: [
        "border-sport-basketball-primary",
        "border-sport-basketball-secondary",
      ],
      [SportType.SOCCER]: [
        "border-sport-soccer-primary",
        "border-sport-soccer-secondary",
      ],
      [SportType.VOLLEYBALL]: [
        "border-sport-volleyball-primary",
        "border-sport-volleyball-secondary",
      ],
      [SportType.BASEBALL]: [
        "border-sport-baseball-primary",
        "border-sport-baseball-secondary",
      ],
    };

    const colors = sportColors[sport] || ["border-primary", "border-secondary"];
    return colors[index % colors.length];
  };

  // Generate team text colors based on sport
  const getTeamTextColors = (index: number): string => {
    const sportColors = {
      [SportType.TENNIS]: [
        "text-sport-tennis-primary",
        "text-sport-tennis-secondary",
      ],
      [SportType.BASKETBALL]: [
        "text-sport-basketball-primary",
        "text-sport-basketball-secondary",
      ],
      [SportType.SOCCER]: [
        "text-sport-soccer-primary",
        "text-sport-soccer-secondary",
      ],
      [SportType.VOLLEYBALL]: [
        "text-sport-volleyball-primary",
        "text-sport-volleyball-secondary",
      ],
      [SportType.BASEBALL]: [
        "text-sport-baseball-primary",
        "text-sport-baseball-secondary",
      ],
    };

    const colors = sportColors[sport] || ["text-primary", "text-secondary"];
    return colors[index % colors.length];
  };

  // Generate teams based on selected method
  const generateTeams = () => {
    setIsLoading(true);

    // Create a copy of players to work with
    const playersCopy = [...players];

    // Shuffle players for random distribution
    const shuffledPlayers = playersCopy.sort(() => Math.random() - 0.5);

    // Create empty teams
    const newTeams: Team[] = Array.from({ length: maxTeams }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      players: [],
      color: getTeamColors(i),
    }));

    if (
      generationMethod === "balanced" &&
      players.some((p) => p.skill !== undefined)
    ) {
      // Sort players by skill level for balanced distribution
      const sortedPlayers = [...shuffledPlayers].sort(
        (a, b) => (b.skill || 0) - (a.skill || 0),
      );

      // Distribute players in snake draft order (1,2,2,1,1,2,...)
      sortedPlayers.forEach((player, index) => {
        const teamIndex =
          index % (maxTeams * 2) < maxTeams
            ? index % maxTeams
            : maxTeams - 1 - (index % maxTeams);

        newTeams[teamIndex].players.push(player);
      });
    } else {
      // Simple round-robin distribution for random teams
      shuffledPlayers.forEach((player, index) => {
        const teamIndex = index % maxTeams;
        newTeams[teamIndex].players.push(player);
      });
    }

    // Update state
    setTeams(newTeams);
    setAvailablePlayers([]);

    // Notify parent component
    if (onTeamsGenerated) {
      onTeamsGenerated(newTeams);
    }

    setIsLoading(false);
  };

  // Reset teams
  const resetTeams = () => {
    setTeams([]);
    setAvailablePlayers(players);
  };

  // Save teams
  const saveTeams = () => {
    if (onSaveTeams) {
      onSaveTeams(teams);
    }
  };

  // Move player between teams or available players
  const movePlayer = (
    playerId: string,
    sourceTeamId: string | null,
    targetTeamId: string | null,
  ) => {
    // Create copies of state to work with
    const teamsCopy = [...teams];
    let availablePlayersCopy = [...availablePlayers];

    // Find the player
    let player: Player | undefined;

    if (sourceTeamId === null) {
      // Player is coming from available players
      player = availablePlayersCopy.find((p) => p.id === playerId);
      if (player) {
        // Remove from available players
        availablePlayersCopy = availablePlayersCopy.filter(
          (p) => p.id !== playerId,
        );
      }
    } else {
      // Player is coming from a team
      const sourceTeam = teamsCopy.find((t) => t.id === sourceTeamId);
      if (sourceTeam) {
        // Find player in source team
        player = sourceTeam.players.find((p) => p.id === playerId);
        if (player) {
          // Remove from source team
          sourceTeam.players = sourceTeam.players.filter(
            (p) => p.id !== playerId,
          );
        }
      }
    }

    // If player was found, add to target
    if (player) {
      if (targetTeamId === null) {
        // Add to available players
        availablePlayersCopy.push(player);
      } else {
        // Add to target team
        const targetTeam = teamsCopy.find((t) => t.id === targetTeamId);
        if (targetTeam) {
          targetTeam.players.push(player);
        }
      }
    }

    // Update state
    setTeams(teamsCopy);
    setAvailablePlayers(availablePlayersCopy);
  };

  // Render player card
  const renderPlayer = (player: Player, teamId: string | null) => (
    <div
      key={player.id}
      className="flex items-center p-2 rounded-md border border-neutral-200 bg-white mb-2 shadow-sm"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("playerId", player.id);
        e.dataTransfer.setData("sourceTeamId", teamId || "null");
      }}
    >
      <Avatar size="sm" sportType={sport}>
        {player.photoURL ? (
          <AvatarImage src={player.photoURL} alt={player.name} />
        ) : (
          <AvatarFallback sportType={sport}>
            {player.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="ml-2 flex-1 min-w-0">
        <div className="font-medium truncate">{player.name}</div>
        <div className="flex items-center text-xs text-neutral-500">
          {player.position && <span className="mr-2">{player.position}</span>}
          {player.skill !== undefined && (
            <Badge size="xs" variant="outline">
              Skill: {player.skill}
            </Badge>
          )}
        </div>
      </div>
      <button
        className="ml-2 text-neutral-400 hover:text-error-500"
        onClick={() =>
          movePlayer(
            player.id,
            teamId,
            teamId ? null : teams.length > 0 ? teams[0].id : null,
          )
        }
      >
        {teamId ? (
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </button>
    </div>
  );

  // Render team card
  const renderTeam = (team: Team, index: number) => (
    <Card
      key={team.id}
      className={`${getTeamColors(index)} border ${getTeamBorderColors(index)}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${getTeamTextColors(index)}`}>
          {team.name}
        </CardTitle>
      </CardHeader>
      <CardContent
        className="pt-0"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const playerId = e.dataTransfer.getData("playerId");
          const sourceTeamId = e.dataTransfer.getData("sourceTeamId");
          movePlayer(
            playerId,
            sourceTeamId === "null" ? null : sourceTeamId,
            team.id,
          );
        }}
      >
        <div className="text-sm text-neutral-600 mb-2">
          {team.players.length} players
        </div>
        <div className="space-y-2">
          {team.players.map((player) => renderPlayer(player, team.id))}
        </div>
        {team.players.length === 0 && (
          <div className="text-center py-4 text-neutral-400 border border-dashed border-neutral-300 rounded-md">
            Drop players here
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Team Builder</h2>
          <div className="flex space-x-2">
            <Badge sportType={sport}>{sport}</Badge>
            <Badge variant="outline">{players.length} Players</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Team generation method */}
          <div className="flex rounded-md overflow-hidden border border-neutral-300">
            <button
              className={`px-3 py-1 text-sm ${
                generationMethod === "balanced"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
              onClick={() => setGenerationMethod("balanced")}
            >
              Balanced
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                generationMethod === "random"
                  ? "bg-primary text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
              onClick={() => setGenerationMethod("random")}
            >
              Random
            </button>
          </div>

          {/* Action buttons */}
          <Button
            variant="primary"
            size="sm"
            sportType={sport}
            onClick={generateTeams}
            isLoading={isLoading}
          >
            Generate Teams
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetTeams}
            disabled={isLoading || teams.length === 0}
          >
            Reset
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={saveTeams}
            disabled={isLoading || teams.length === 0}
          >
            Save Teams
          </Button>
        </div>
      </div>

      {/* Team builder layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Available players */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Players</CardTitle>
          </CardHeader>
          <CardContent
            className="pt-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const playerId = e.dataTransfer.getData("playerId");
              const sourceTeamId = e.dataTransfer.getData("sourceTeamId");
              movePlayer(
                playerId,
                sourceTeamId === "null" ? null : sourceTeamId,
                null,
              );
            }}
          >
            <div className="text-sm text-neutral-600 mb-2">
              {availablePlayers.length} players
            </div>
            <div className="space-y-2">
              {availablePlayers.map((player) => renderPlayer(player, null))}
            </div>
            {availablePlayers.length === 0 && (
              <div className="text-center py-4 text-neutral-400 border border-dashed border-neutral-300 rounded-md">
                All players assigned to teams
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team, index) => renderTeam(team, index))}

          {/* Empty state */}
          {teams.length === 0 && (
            <div className="md:col-span-2">
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">No teams created yet</h3>
                  <p className="text-neutral-500 max-w-md">
                    Click &quot;Generate Teams&quot; to automatically create
                    balanced teams, or manually assign players to teams by
                    dragging them.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
