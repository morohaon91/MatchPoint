import { NextRequest, NextResponse } from "next/server";
import { 
  getTeamAssignments, 
  saveTeamAssignments, 
  updateTeamAssignments, 
  deleteTeamAssignments,
  getGame,
  canManageGames
} from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/games/[gameId]/teams
 * Get team assignments for a game
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const gameId = params.gameId;
    
    // Get the team assignments
    const teamAssignments = await getTeamAssignments(gameId);
    
    return NextResponse.json({ teamAssignments });
  } catch (error: any) {
    console.error("Error getting team assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get team assignments" }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[gameId]/teams
 * Save team assignments for a game
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const gameId = params.gameId;
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user has permission to manage teams for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to manage teams for this game" }, { status: 403 });
    }
    
    // Parse the request body
    const { teams } = await req.json();
    
    if (!teams || typeof teams !== 'object') {
      return NextResponse.json({ error: "Teams data is required" }, { status: 400 });
    }
    
    // Save the team assignments
    const teamAssignments = await saveTeamAssignments(gameId, teams, userId);
    
    return NextResponse.json({ teamAssignments });
  } catch (error: any) {
    console.error("Error saving team assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save team assignments" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[gameId]/teams
 * Update team assignments for a game
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const gameId = params.gameId;
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user has permission to manage teams for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to manage teams for this game" }, { status: 403 });
    }
    
    // Check if team assignments exist
    const existingTeamAssignments = await getTeamAssignments(gameId);
    
    if (!existingTeamAssignments) {
      return NextResponse.json({ error: "Team assignments not found" }, { status: 404 });
    }
    
    // Parse the request body
    const { teams } = await req.json();
    
    if (!teams || typeof teams !== 'object') {
      return NextResponse.json({ error: "Teams data is required" }, { status: 400 });
    }
    
    // Update the team assignments
    await updateTeamAssignments(gameId, teams);
    
    // Get the updated team assignments
    const updatedTeamAssignments = await getTeamAssignments(gameId);
    
    return NextResponse.json({ teamAssignments: updatedTeamAssignments });
  } catch (error: any) {
    console.error("Error updating team assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update team assignments" }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]/teams
 * Delete team assignments for a game
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const gameId = params.gameId;
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user has permission to manage teams for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to manage teams for this game" }, { status: 403 });
    }
    
    // Delete the team assignments
    await deleteTeamAssignments(gameId);
    
    return NextResponse.json({ message: "Team assignments deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting team assignments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete team assignments" }, 
      { status: 500 }
    );
  }
}
