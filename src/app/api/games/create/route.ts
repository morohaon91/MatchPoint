import { NextResponse, NextRequest } from "next/server";
import {
  Timestamp,
  FieldValue,
  getFirestore,
  WriteBatch,
} from "firebase-admin/firestore"; // Corrected WriteBatch casing
import { initializeAdmin } from "../../../../lib/firebase/firebaseAdmin";
import {
  Game,
  GameStatus,
  RecurringSeries,
} from "../../../../lib/types/models";
import { getCurrentUser } from "../../../../lib/auth/get-current-user"; // Assuming this path is correct or will be created

const admin = initializeAdmin();
const db = getFirestore(admin.app()); // Get Firestore instance from the initialized admin app

// Helper to parse date and time into a Firestore Timestamp
function parseDateTime(dateStr: string, timeStr: string): Timestamp {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  // Month is 0-indexed in JavaScript Date
  return Timestamp.fromDate(new Date(year, month - 1, day, hours, minutes));
}

function parseDate(dateStr: string): Timestamp {
  const [year, month, day] = dateStr.split("-").map(Number);
  return Timestamp.fromDate(new Date(year, month - 1, day));
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the body first to extract groupId for permission check
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
    }

    // Check if user has permission to create games in this group
    try {
      const groupMemberRef = db
        .collection("groups")
        .doc(groupId)
        .collection("members")
        .doc(currentUser.uid);
      const memberDoc = await groupMemberRef.get();

      if (!memberDoc.exists) {
        return NextResponse.json(
          { error: "You are not a member of this group" },
          { status: 403 },
        );
      }

      const memberData = memberDoc.data();
      if (
        !memberData ||
        (memberData.role !== "admin" && memberData.role !== "organizer")
      ) {
        return NextResponse.json(
          {
            error:
              "You must be an admin or organizer of this group to create games",
            details: "Your current role does not have sufficient permissions",
          },
          { status: 403 },
        );
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      return NextResponse.json(
        {
          error: "Failed to verify permissions",
          details:
            "Could not check if you have permission to create games in this group",
        },
        { status: 500 },
      );
    }

    // Continue with the rest of the request data
    const {
      title,
      description,
      scheduledTime, // ISO string from datetime-local input
      endTime, // ISO string from datetime-local input
      location,
      maxParticipants = 0, // Default to 0 if not provided, meaning unlimited
      minParticipants = 2, // Default minimum
      isRecurring,
      isPrivate,
      isOpenToGuests,
      sport,
      recurringDetails, // Contains frequency, dayOfWeek, startDate, endDate/occurrences
    } = body;

    // Basic Validation
    if (!title || !scheduledTime || !location || !groupId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // const db is now defined above
    const batch: WriteBatch = db.batch(); // Use db.batch() and type WriteBatch

    // Create game in the top-level games collection to match security rules
    const gamesCollectionRef = db.collection("games");
    const newGameRef = gamesCollectionRef.doc(); // Auto-generate ID for the game on the collection reference

    // Parse the scheduledTime from ISO string to Date
    const scheduledDate = new Date(scheduledTime);

    const newGameData: Partial<Game> = {
      groupId,
      title,
      description: description || "",
      scheduledTime: scheduledDate, // Use the parsed date directly
      location,
      maxParticipants: Number(maxParticipants) || 0,
      minParticipants: Number(minParticipants) || 2,
      participantIds: [], // Initialize empty array
      waitlistIds: [], // Initialize empty array
      status: GameStatus.UPCOMING,
      sport: sport, // Use the sport from the form
      isRecurring: !!isRecurring,
      isPrivate: !!isPrivate,
      isOpenToGuests: !!isOpenToGuests,
      createdBy: currentUser.uid,
      hostId: currentUser.uid, // Set host to creator
      hostName: "Game Host", // Default host name
      createdAt: new Date(), // Current date
      updatedAt: new Date(), // Current date
    };

    if (endTime) {
      const endDate = new Date(endTime);
      if (endDate <= scheduledDate) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 },
        );
      }
      // Add endTime to game data
      newGameData.endTime = endDate;
    }

    let recurringSeriesId: string | undefined = undefined;

    if (isRecurring && recurringDetails) {
      const {
        frequency,
        dayOfWeek, // For weekly/bi-weekly
        // startDate from recurringDetails is the same as game's dateStr for the first game
        endDate: recurringEndDateStr, // YYYY-MM-DD
        // occurrences - for simplicity, we'll focus on endDate for now or assume a fixed number if not generating all games
      } = recurringDetails as Partial<RecurringSeries> & {
        startDate: string;
        endDate?: string;
      };

      if (!frequency) {
        return NextResponse.json(
          { error: "Recurring frequency is required" },
          { status: 400 },
        );
      }
      if (
        (frequency === "weekly" || frequency === "biweekly") &&
        dayOfWeek === undefined
      ) {
        return NextResponse.json(
          {
            error:
              "Day of the week is required for weekly/bi-weekly recurring games",
          },
          { status: 400 },
        );
      }

      const seriesCollectionRef = db
        .collection("groups")
        .doc(groupId)
        .collection("recurringSeries"); // Use db.collection().doc().collection()
      const newSeriesRef = seriesCollectionRef.doc(); // Auto-generate ID on the collection reference
      recurringSeriesId = newSeriesRef.id;

      // Use the scheduledTime from the form for the series start
      const seriesStartDate = new Date(scheduledTime);

      const newSeriesData: Partial<RecurringSeries> = {
        groupId,
        frequency,
        startTime: seriesStartDate.toTimeString().substring(0, 5), // Extract HH:MM
        startDate: seriesStartDate,
        dayOfWeek:
          frequency === "weekly" || frequency === "biweekly"
            ? Number(dayOfWeek)
            : undefined,
        createdBy: currentUser.uid,
        hostId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        gameIds: [],
        isActive: true,
        duration: 120, // Default 2 hours in minutes
      };

      if (recurringDetails.endDate) {
        try {
          const endDate = new Date(recurringDetails.endDate);
          if (endDate < seriesStartDate) {
            return NextResponse.json(
              {
                error:
                  "Recurring series end date cannot be before its start date",
              },
              { status: 400 },
            );
          }
          newSeriesData.endDate = endDate;
        } catch (e) {
          return NextResponse.json(
            { error: "Invalid recurring end date format" },
            { status: 400 },
          );
        }
      }

      batch.set(newSeriesRef, newSeriesData);
      newGameData.recurringSeriesId = recurringSeriesId;
    }

    batch.set(newGameRef, newGameData);

    try {
      console.log("Attempting to commit batch with game data:", {
        gameId: newGameRef.id,
        groupId,
        title,
        isRecurring,
        recurringSeriesId,
      });

      await batch.commit();

      console.log("Game created successfully:", {
        gameId: newGameRef.id,
        groupId,
        recurringSeriesId,
      });

      return NextResponse.json(
        {
          message: "Game created successfully",
          gameId: newGameRef.id,
          recurringSeriesId: recurringSeriesId,
        },
        { status: 201 },
      );
    } catch (commitError: any) {
      console.error("Error committing batch:", commitError);
      return NextResponse.json(
        {
          error: "Failed to save game data to database",
          details: commitError.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Error creating game:", error);

    // Log detailed information about the request
    // Use safe error logging that doesn't depend on variables that might not be defined
    console.error("Error stack:", error.stack);

    // It's good practice to avoid sending raw error messages to the client
    // if they might contain sensitive information.
    let errorMessage = "Failed to create game due to an internal error.";
    let statusCode = 500;

    if (error.message && typeof error.message === "string") {
      // Handle specific error types
      if (error.message.startsWith("Unauthorized")) {
        errorMessage = error.message;
        statusCode = 401;
      } else if (
        error.message.startsWith("Missing required fields") ||
        error.message.startsWith("Invalid")
      ) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error.code === "permission-denied") {
        errorMessage =
          "You don't have permission to create games in this group";
        statusCode = 403;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        requestId: Date.now().toString(), // Add a unique ID to help with debugging
      },
      { status: statusCode },
    );
  }
}

// Placeholder for GET if needed, or remove if not used.
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "This endpoint is for POSTing new games.",
  });
}
