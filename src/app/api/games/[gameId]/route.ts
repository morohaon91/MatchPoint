import { NextRequest, NextResponse } from "next/server";
import { 
  getGame, 
  updateGame, 
  deleteGame,
  canManageGames,
  isGroupMember
} from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/games/[gameId]
 * Get details of a specific game
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    
    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }
    
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    let userId = "";
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      
      // Verify the token and get the user ID
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Error verifying token:", error);
      }
    }
    
    // Get the game
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user is a member of the group
    if (userId) {
      const isMember = await isGroupMember(userId, game.groupId);
      
      if (!isMember) {
        return NextResponse.json(
          { error: "You do not have permission to view this game" }, 
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }
    
    return NextResponse.json({ game });
  } catch (error: any) {
    console.error("Error getting game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get game" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[gameId]
 * Update a game
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    
    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }
    
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user can manage games for this group
    const canManage = await canManageGames(userId, game.groupId);
    
    if (!canManage) {
      return NextResponse.json(
        { error: "You do not have permission to update this game" }, 
        { status: 403 }
      );
    }
    
    // Parse the request body
    const gameData = await req.json();
    
    // Update the game
    await updateGame(gameId, gameData);
    
    // Get the updated game
    const updatedGame = await getGame(gameId);
    
    return NextResponse.json({ game: updatedGame });
  } catch (error: any) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update game" }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]
 * Delete a game
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params;
    
    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }
    
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user can manage games for this group
    const canManage = await canManageGames(userId, game.groupId);
    
    if (!canManage) {
      return NextResponse.json(
        { error: "You do not have permission to delete this game" }, 
        { status: 403 }
      );
    }
    
    // Delete the game
    await deleteGame(gameId);
    
    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete game" }, 
      { status: 500 }
    );
  }
}
