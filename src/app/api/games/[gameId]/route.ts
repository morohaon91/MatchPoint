import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";
import { Game } from "@/lib/types/models";
import { isGroupMember } from "@/lib/services";

// Initialize Firebase Admin
const admin = initializeAdmin();
const db = getFirestore();
const adminAuth = admin.auth();

export async function GET(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  const { gameId } = params;

  if (!gameId) {
    return NextResponse.json(
      { error: "Game ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];

      // Verify the token and get the user ID
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Error verifying token:", error);
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the game document
    const gameDoc = await db.collection("games").doc(gameId).get();

    if (!gameDoc.exists) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    const gameData = gameDoc.data() as Game;

    // Check if the user is a member of the group
    if (gameData.groupId) {
      const isMember = await isGroupMember(userId, gameData.groupId);

      if (!isMember) {
        return NextResponse.json(
          { error: "You do not have permission to view this game" },
          { status: 403 }
        );
      }
    }

    // Return the game data
    return NextResponse.json({
      game: {
        ...gameData,
        id: gameDoc.id,
      }
    });
  } catch (error: any) {
    console.error("Error getting game:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get game" },
      { status: 500 }
    );
  }
}
