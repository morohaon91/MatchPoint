import { NextRequest, NextResponse } from "next/server";
import { 
  getGame,
  getGameParticipants,
  addGameParticipant,
  updateGameParticipantStatus,
  removeGameParticipant,
  canManageGames,
  isGroupMember
} from "@/lib/services";
import { ParticipantStatus } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/games/[gameId]/participants
 * Get participants of a specific game
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
    
    // Get the game to check permissions
    const game = await getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    
    // Check if the user is a member of the group
    if (userId) {
      const isMember = await isGroupMember(userId, game.groupId);
      
      if (!isMember) {
        return NextResponse.json(
          { error: "You do not have permission to view participants for this game" }, 
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }
    
    // Get the participants
    const participants = await getGameParticipants(gameId);
    
    // Get user details for each participant
    const participantsWithDetails = await Promise.all(
      participants.map(async (participant) => {
        if (participant.isGuest) {
          return participant;
        }
        
        const userDoc = await admin.firestore()
          .collection("users")
          .doc(participant.userId)
          .get();
        
        const userData = userDoc.data() || {};
        
        return {
          ...participant,
          user: {
            uid: participant.userId,
            name: userData.name || "",
            email: userData.email || "",
            photoURL: userData.photoURL || ""
          }
        };
      })
    );
    
    return NextResponse.json({ participants: participantsWithDetails });
  } catch (error: any) {
    console.error("Error getting game participants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get game participants" }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[gameId]/participants
 * Register for a game or add a participant
 */
export async function POST(
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
    
    // Parse the request body
    const { participantId, isGuest = false, guestName, status = "pending" } = await req.json();
    
    // If adding someone else or a guest, check if user can manage games
    if ((participantId && participantId !== userId) || isGuest) {
      const canManage = await canManageGames(userId, game.groupId);
      
      if (!canManage) {
        return NextResponse.json(
          { error: "You do not have permission to add participants to this game" }, 
          { status: 403 }
        );
      }
    }
    
    // Check if the user is a member of the group
    const isMember = await isGroupMember(userId, game.groupId);
    
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member of the group to register for games" }, 
        { status: 403 }
      );
    }
    
    // Register for the game
    const participant = await addGameParticipant(
      gameId, 
      participantId || userId, 
      status === 'confirmed' ? ParticipantStatus.CONFIRMED : ParticipantStatus.WAITLIST
    );
    
    return NextResponse.json({ participant });
  } catch (error: any) {
    console.error("Error registering for game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register for game" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[gameId]/participants
 * Update a participant's status
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
    
    // Parse the request body
    const { participantId, status } = await req.json();
    
    if (!participantId || !status) {
      return NextResponse.json(
        { error: "Participant ID and status are required" }, 
        { status: 400 }
      );
    }
    
    // If updating someone else's status, check if user can manage games
    if (participantId !== userId) {
      const canManage = await canManageGames(userId, game.groupId);
      
      if (!canManage) {
        return NextResponse.json(
          { error: "You do not have permission to update participant status" }, 
          { status: 403 }
        );
      }
    }
    
    // Update the participant's status
    await updateGameParticipantStatus(gameId, participantId, status);
    
    return NextResponse.json({ message: "Participant status updated successfully" });
  } catch (error: any) {
    console.error("Error updating participant status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update participant status" }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[gameId]/participants
 * Remove a participant from a game
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
    
    // Parse the URL to get the participant ID
    const url = new URL(req.url);
    const participantId = url.searchParams.get("participantId");
    
    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 });
    }
    
    // If removing someone else, check if user can manage games
    if (participantId !== userId) {
      const canManage = await canManageGames(userId, game.groupId);
      
      if (!canManage) {
        return NextResponse.json(
          { error: "You do not have permission to remove participants from this game" }, 
          { status: 403 }
        );
      }
    }
    
    // Remove the participant
    await removeGameParticipant(gameId, participantId);
    
    return NextResponse.json({ message: "Participant removed successfully" });
  } catch (error: any) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove participant" }, 
      { status: 500 }
    );
  }
}
