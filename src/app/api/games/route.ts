import { NextRequest, NextResponse } from "next/server";
import { 
  createGame, 
  getGroupGames,
  canManageGames,
  isGroupMember
} from "@/lib/services";
import { Game, GameStatus } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/games
 * Get games based on query parameters
 * - groupId: required, the ID of the group to get games for
 * - status: optional, filter games by status
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const groupId = url.searchParams.get("groupId");
    const status = url.searchParams.get("status") as GameStatus | null;
    
    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" }, 
        { status: 400 }
      );
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
    
    // Check if the user is a member of the group
    if (userId) {
      const isMember = await isGroupMember(userId, groupId);
      
      if (!isMember) {
        return NextResponse.json(
          { error: "You do not have permission to view games for this group" }, 
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }
    
    // Get games for the group
    const games: Game[] = await getGroupGames(groupId);
    
    // Filter by status if specified
    const filteredGames = status 
      ? games.filter(game => game.status === status)
      : games;
    
    return NextResponse.json({ games: filteredGames });
  } catch (error: any) {
    console.error("Error getting games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get games" }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/games
 * Create a new game
 */
export async function POST(req: NextRequest) {
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
    
    // Parse the request body
    const gameData = await req.json();
    
    // Validate required fields
    if (!gameData.groupId || !gameData.title || !gameData.date) {
      return NextResponse.json(
        { error: "Group ID, title, and date are required" }, 
        { status: 400 }
      );
    }
    
    // Check if the user can manage games for this group
    const canManage = await canManageGames(userId, gameData.groupId);
    
    if (!canManage) {
      return NextResponse.json(
        { error: "You do not have permission to create games for this group" }, 
        { status: 403 }
      );
    }
    
    // Create the game
    const game = await createGame(gameData, userId);
    
    return NextResponse.json({ game });
  } catch (error: any) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create game" }, 
      { status: 500 }
    );
  }
}
