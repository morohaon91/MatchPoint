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
import { db } from "@/lib/firebase/firebaseClient";
import { doc, runTransaction } from "firebase/firestore";

// Initialize Firebase Admin
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
    if (userId && game.groupId) {
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
    
    // Use a transaction to safely update the game participants
    await runTransaction(db, async (transaction) => {
      const gameRef = doc(db, "games", gameId);
      const gameDoc = await transaction.get(gameRef);
    
      if (!gameDoc.exists()) {
        throw new Error("Game not found");
      }
      
      const gameData = gameDoc.data();
      if (!gameData) {
        throw new Error("Game data not found");
      }

      const participantIds = gameData.participantIds || [];
      const maxParticipants = gameData.maxParticipants || 0;
      
      // Check if user is already a participant
      if (participantIds.includes(userId)) {
        throw new Error("User is already a participant");
    }
    
      // Check if game is full
      if (participantIds.length >= maxParticipants) {
        throw new Error("Game is full");
    }
    
      // Add user to participants and increment count
      transaction.update(gameRef, {
        participantIds: [...participantIds, userId],
        currentParticipants: (participantIds.length + 1),
        updatedAt: new Date()
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to join game" },
      { status: 400 }
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
    if (participantId !== userId && game.groupId) {
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
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get('participantId');
    
    if (!gameId || !participantId) {
      return NextResponse.json({ error: "Game ID and participant ID are required" }, { status: 400 });
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
    
    // Only allow users to remove themselves
    if (userId !== participantId) {
      return NextResponse.json({ error: "Unauthorized to remove other participants" }, { status: 403 });
    }
    
    // Use a transaction to safely update the game participants
    await runTransaction(db, async (transaction) => {
      const gameRef = doc(db, "games", gameId);
      const gameDoc = await transaction.get(gameRef);
    
      if (!gameDoc.exists()) {
        throw new Error("Game not found");
      }
      
      const gameData = gameDoc.data();
      if (!gameData) {
        throw new Error("Game data not found");
      }

      const participantIds = gameData.participantIds || [];
      
      // Check if user is a participant
      if (!participantIds.includes(userId)) {
        throw new Error("User is not a participant");
      }
      
      // Remove user from participants and decrement count
      transaction.update(gameRef, {
        participantIds: participantIds.filter((id: string) => id !== userId),
        currentParticipants: (participantIds.length - 1),
        updatedAt: new Date()
      });
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to leave game" },
      { status: 400 }
    );
  }
}
