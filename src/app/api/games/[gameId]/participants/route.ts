import { NextRequest, NextResponse } from "next/server";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeAdmin } from "../../../../../lib/firebase/firebaseAdmin"; // Adjust path as needed
import {
  Game,
  GameParticipant,
  ParticipantStatus,
  UserRole,
} from "../../../../../lib/types/models"; // Adjust path

// Initialize Firebase Admin SDK
const admin = initializeAdmin();
const db = getFirestore();

interface ParticipantParams {
  params: {
    gameId: string;
  };
}

/**
 * @swagger
 * /api/games/{gameId}/participants:
 *   get:
 *     summary: Get all participants for a specific game
 *     description: Retrieves a list of all participants associated with a given game ID.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: The ID of the game.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of game participants.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameParticipant'
 *       404:
 *         description: Game not found or no participants found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest, { params }: ParticipantParams) {
  const { gameId } = params;

  if (!gameId) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
  }

  try {
    const participantsSnapshot = await db
      .collection("games")
      .doc(gameId)
      .collection("participants")
      .get();

    if (participantsSnapshot.empty) {
      return NextResponse.json(
        { error: "No participants found for this game or game does not exist" },
        { status: 404 },
      );
    }

    const participants: GameParticipant[] = participantsSnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          id: doc.id, // Participant document ID (usually userId)
          userId: data.userId,
          gameId: gameId,
          status: data.status || ParticipantStatus.CONFIRMED,
          joinedAt: data.joinedAt, // Should be a FirestoreTimestamp
          registeredAt: data.registeredAt, // Should be a FirestoreTimestamp
          role: data.role || "player",
          isGuest: data.isGuest || false,
          displayName: data.displayName, // Denormalized data
          photoURL: data.photoURL, // Denormalized data
        } as GameParticipant;
      },
    );

    return NextResponse.json(participants, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching participants for game ${gameId}:`, error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * @swagger
 * /api/games/{gameId}/participants:
 *   post:
 *     summary: Add a participant to a specific game
 *     description: Adds a new participant to the specified game.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: The ID of the game.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to add as a participant.
 *               role:
 *                 type: string
 *                 description: The role of the participant (e.g., player, host). Defaults to 'player'.
 *                 enum: ['player', 'host', 'organizer'] # Reflects GameParticipant role
 *               status:
 *                 $ref: '#/components/schemas/ParticipantStatus' # If status can be set on add
 *                 description: The status of the participant. Defaults to 'CONFIRMED'.
 *     responses:
 *       201:
 *         description: Participant added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameParticipant'
 *       400:
 *         description: Bad request (e.g., missing userId, game full, user already participant).
 *       401:
 *         description: Unauthorized (e.g., not authenticated).
 *       403:
 *         description: Forbidden (e.g., authenticated user lacks permission).
 *       404:
 *         description: Game not found.
 *       500:
 *         description: Internal server error.
 */
export async function POST(
  request: NextRequest,
  { params }: ParticipantParams,
) {
  const { gameId } = params;

  if (!gameId) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }
    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      console.error("Error verifying token:", authError);
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const authUserId = decodedToken.uid; // ID of the user making the request

    let body;
    try {
      // Check if the request has a body
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        body = await request.json();
      } else {
        // If no JSON body, treat as empty or handle as an error depending on requirements
        // For this endpoint, we expect a JSON body with userId.
        return NextResponse.json(
          {
            error:
              "Invalid request: Content-Type must be application/json and body must not be empty.",
          },
          { status: 400 },
        );
      }
    } catch (jsonError: any) {
      console.error("Error parsing JSON request body:", jsonError);
      return NextResponse.json(
        {
          error: "Invalid request: Malformed JSON in request body.",
          details: jsonError.message,
        },
        { status: 400 },
      );
    }

    // Ensure body is not null or undefined after parsing attempts
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request: Missing request body." },
        { status: 400 },
      );
    }

    const { userId, role, status } = body; // userId of participant to add

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required in the request body" },
        { status: 400 },
      );
    }

    // --- Authorization Placeholder ---
    // Here, you'd check if authUserId has permission to add userId to gameId.
    // For example, is authUserId the game host, a group admin, or is userId === authUserId (joining self)?
    // const gameHostId = "fetch_game_host_id"; // Pseudocode
    // if (authUserId !== gameHostId && authUserId !== userId) {
    //   return NextResponse.json({ error: 'Forbidden: You do not have permission to add this participant.' }, { status: 403 });
    // }
    // --- End Authorization Placeholder ---

    const gameRef = db.collection("games").doc(gameId);
    const participantRef = gameRef.collection("participants").doc(userId);

    const newParticipantData: Omit<
      GameParticipant,
      "id" | "gameId" | "displayName" | "photoURL"
    > = {
      userId: userId,
      role: role || "player",
      status: status || ParticipantStatus.CONFIRMED,
      joinedAt: Timestamp.now(),
      registeredAt: Timestamp.now(),
      isGuest: body.isGuest || false,
    };

    await db.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) {
        throw new Error("Game not found");
      }
      const gameData = gameDoc.data() as Game;

      if (
        gameData.maxParticipants &&
        gameData.currentParticipants >= gameData.maxParticipants
      ) {
        throw new Error("Game is full");
      }

      const existingParticipantDoc = await transaction.get(participantRef);
      if (existingParticipantDoc.exists) {
        throw new Error("User is already a participant in this game");
      }

      transaction.set(participantRef, newParticipantData);
      transaction.update(gameRef, {
        currentParticipants: FieldValue.increment(1),
        participantIds: FieldValue.arrayUnion(userId),
      });
    });

    const createdParticipant: GameParticipant = {
      id: userId,
      gameId: gameId,
      ...newParticipantData,
    };

    return NextResponse.json(createdParticipant, { status: 201 });
  } catch (error: any) {
    console.error(`Error adding participant to game ${gameId}:`, error);
    if (error.message === "Game not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error.message === "Game is full" ||
      error.message === "User is already a participant in this game"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    // Catch errors from the new JSON parsing logic specifically
    if (error.message.startsWith("Invalid request:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
