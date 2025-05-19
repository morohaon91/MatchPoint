import { NextRequest, NextResponse } from "next/server";
import { 
  processWaitlist,
  getUserPriorityStatus,
  getGame,
  canManageGames
} from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * POST /api/games/[gameId]/waitlist/process
 * Process the waitlist for a game
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
    
    // Check if the user has permission to manage this game
    const hasPermission = await canManageGames(game.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to process the waitlist for this game" }, { status: 403 });
    }
    
    // Process the waitlist
    const promotedCount = await processWaitlist(gameId);
    
    return NextResponse.json({ 
      message: `${promotedCount} participants promoted from the waitlist`,
      promotedCount
    });
  } catch (error: any) {
    console.error("Error processing waitlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process waitlist" }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/games/[gameId]/waitlist/status
 * Get a user's priority status for a game
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
    
    // Get the user's priority status
    const priorityStatus = await getUserPriorityStatus(gameId, userId);
    
    return NextResponse.json({ priorityStatus });
  } catch (error: any) {
    console.error("Error getting priority status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get priority status" }, 
      { status: 500 }
    );
  }
}
