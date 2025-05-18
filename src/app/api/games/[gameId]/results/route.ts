import { NextRequest, NextResponse } from "next/server";
import { 
  getGameResult, 
  recordGameResult, 
  updateGameResult, 
  deleteGameResult,
  getGame,
  canManageGames
} from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/games/[gameId]/results
 * Get results for a game
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
    
    // Get the game result
    const gameResult = await getGameResult(gameId);
    
    return NextResponse.json({ gameResult });
  } catch (error: any) {
    console.error("Error getting game result:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get game result" }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[gameId]/results
 * Record a result for a game
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
    
    // Check if the user has permission to manage results for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to record results for this game" }, { status: 403 });
    }
    
    // Check if a result already exists
    const existingResult = await getGameResult(gameId);
    
    if (existingResult) {
      return NextResponse.json({ error: "A result already exists for this game" }, { status: 409 });
    }
    
    // Parse the request body
    const resultData = await req.json();
    
    if (!resultData.scores || typeof resultData.scores !== 'object') {
      return NextResponse.json({ error: "Scores data is required" }, { status: 400 });
    }
    
    if (!resultData.attendees || !Array.isArray(resultData.attendees)) {
      return NextResponse.json({ error: "Attendees data is required" }, { status: 400 });
    }
    
    // Record the game result
    const gameResult = await recordGameResult(gameId, resultData, userId);
    
    return NextResponse.json({ gameResult });
  } catch (error: any) {
    console.error("Error recording game result:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record game result" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[gameId]/results
 * Update a result for a game
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
    
    // Check if the user has permission to manage results for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to update results for this game" }, { status: 403 });
    }
    
    // Check if a result exists
    const existingResult = await getGameResult(gameId);
    
    if (!existingResult) {
      return NextResponse.json({ error: "No result found for this game" }, { status: 404 });
    }
    
    // Parse the request body
    const resultData = await req.json();
    
    // Update the game result
    await updateGameResult(gameId, resultData);
    
    // Get the updated game result
    const updatedResult = await getGameResult(gameId);
    
    return NextResponse.json({ gameResult: updatedResult });
  } catch (error: any) {
    console.error("Error updating game result:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update game result" }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]/results
 * Delete a result for a game
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
    
    // Check if the user has permission to manage results for this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to delete results for this game" }, { status: 403 });
    }
    
    // Check if a result exists
    const existingResult = await getGameResult(gameId);
    
    if (!existingResult) {
      return NextResponse.json({ error: "No result found for this game" }, { status: 404 });
    }
    
    // Delete the game result
    await deleteGameResult(gameId);
    
    return NextResponse.json({ message: "Game result deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting game result:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete game result" }, 
      { status: 500 }
    );
  }
}
