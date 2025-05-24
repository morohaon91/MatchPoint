import { NextResponse, NextRequest } from "next/server";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { initializeAdmin } from "../../../../lib/firebase/firebaseAdmin";
import {
  Game,
  GameStatus,
  RecurringSeries,
} from "../../../../lib/types/models";
import { getCurrentUser } from "../../../../lib/auth/get-current-user";
import { canManageGames } from "@/lib/services";

// Initialize Firebase Admin
const admin = initializeAdmin();
const db = getFirestore();
const adminAuth = admin.auth();

// Helper to parse an ISO-like datetime string (YYYY-MM-DDTHH:MM) into an Admin Firestore Timestamp
function parseDateTime(isoDateTimeStr: string): Timestamp {
  if (typeof isoDateTimeStr !== "string") {
    throw new Error("Invalid input: datetime string must be a string.");
  }
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
  const match = isoDateTimeStr.match(isoRegex);

  if (!match) {
    throw new Error(
      `Invalid datetime format for '${isoDateTimeStr}'. Expected YYYY-MM-DDTHH:MM.`,
    );
  }

  const [, yearStr, monthStr, dayStr, hoursStr, minutesStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if ([year, month, day, hours, minutes].some(isNaN)) {
    throw new Error(
      `Invalid date or time value in '${isoDateTimeStr}'. Contains non-numeric parts where numbers are expected.`,
    );
  }

  const date = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(date.getTime())) {
    throw new Error(
      `Failed to construct a valid date from '${isoDateTimeStr}'. Input results in an invalid Date object (NaN).`,
    );
  }

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) {
    throw new Error(
      `Date components mismatch for '${isoDateTimeStr}'. Likely an invalid day/month combination (e.g., 2023-02-30T10:00) or invalid time component that caused date rollover.`,
    );
  }

  try {
    return Timestamp.fromDate(date);
  } catch (e: any) {
    throw new Error(
      `Error converting date '${isoDateTimeStr}' to Firestore Timestamp: ${e.message}`,
    );
  }
}

// parseDate remains for YYYY-MM-DD strings
function parseDate(dateStr: string): Timestamp {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(
      `Invalid date format for '${dateStr}'. Expected YYYY-MM-DD.`,
    );
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  if ([year, month, day].some(isNaN)) {
    throw new Error(
      `Invalid date value in '${dateStr}'. Contains non-numeric parts.`,
    );
  }
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) {
    throw new Error(
      `Failed to construct a valid date from '${dateStr}'. Resulting date is invalid.`,
    );
  }
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(
      `Date components mismatch for '${dateStr}'. Likely an invalid day for the month (e.g., Feb 30).`,
    );
  }
  try {
    return Timestamp.fromDate(date);
  } catch (e: any) {
    throw new Error(
      `Error converting date '${dateStr}' to Firestore Timestamp: ${e.message}`,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUser = decodedToken;

    const {
      groupId,
      title,
      description,
      scheduledTime, // Expected as YYYY-MM-DDTHH:MM
      endTime, // Optional, expected as YYYY-MM-DDTHH:MM
      location,
      maxParticipants,
      minParticipants,
      sport,
      isRecurring,
      isPrivate,
      isOpenToGuests,
      recurringDetails, // Contains endDate as YYYY-MM-DD
    } = await request.json();

    const canManage = await canManageGames(currentUser.uid, groupId);
    if (!canManage) {
      return NextResponse.json(
        { error: "You do not have permission to create games in this group" },
        { status: 403 },
      );
    }

    // scheduledTime is YYYY-MM-DDTHH:MM, use parseDateTime
    const scheduledDateAdminTs = parseDateTime(scheduledTime);

    const newGameData: Partial<Game> = {
      groupId,
      title,
      description: description || "",
      scheduledTime: scheduledDateAdminTs, // Admin Timestamp
      location,
      maxParticipants: Number(maxParticipants) || 0,
      minParticipants: Number(minParticipants) || 2,
      participantIds: [],
      waitlistIds: [],
      status: GameStatus.UPCOMING,
      sport: sport,
      isRecurring: !!isRecurring,
      isPrivate: !!isPrivate,
      isOpenToGuests: !!isOpenToGuests,
      createdBy: currentUser.uid,
      hostId: currentUser.uid,
      hostName: "Game Host",
      createdAt: Timestamp.now(), // Admin Timestamp
      updatedAt: Timestamp.now(), // Admin Timestamp
      currentParticipants: 0,
    };

    if (endTime) {
      // endTime is YYYY-MM-DDTHH:MM, use parseDateTime
      const gameEndDateAdminTs = parseDateTime(endTime);
      if (gameEndDateAdminTs.toMillis() <= scheduledDateAdminTs.toMillis()) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 },
        );
      }
      newGameData.endTime = gameEndDateAdminTs; // Admin Timestamp
    }

    let recurringSeriesId: string | undefined = undefined;

    if (isRecurring && recurringDetails) {
      const { frequency, dayOfWeek } =
        recurringDetails as Partial<RecurringSeries> & {
          startDate: string; // This should align with scheduledTime's date part
          endDate?: string; // YYYY-MM-DD
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
        .collection("recurringSeries");
      const newSeriesRef = seriesCollectionRef.doc();
      recurringSeriesId = newSeriesRef.id;

      // seriesStartDateAdminTs is already parsed from scheduledTime (YYYY-MM-DDTHH:MM)
      const seriesStartDateJsDate = scheduledDateAdminTs.toDate(); // JS Date for RecurringSeries model
      const seriesStartTimeString = seriesStartDateJsDate
        .toTimeString()
        .substring(0, 5); // HH:MM

      const newSeriesData: Partial<RecurringSeries> = {
        groupId,
        frequency,
        startTime: seriesStartTimeString, // string
        startDate: seriesStartDateJsDate, // JS Date, as per RecurringSeries model
        dayOfWeek:
          frequency === "weekly" || frequency === "biweekly"
            ? Number(dayOfWeek)
            : undefined,
        createdBy: currentUser.uid,
        hostId: currentUser.uid,
        createdAt: new Date(), // JS Date, as per RecurringSeries model
        updatedAt: new Date(), // JS Date, as per RecurringSeries model
        gameIds: [],
        isActive: true,
        duration: 120,
      };

      if (recurringDetails.endDate) {
        try {
          // recurringDetails.endDate is YYYY-MM-DD, so use parseDate
          const seriesEndDateAdminTs = parseDate(recurringDetails.endDate);
          // Compare Admin Timestamps for millis
          if (
            seriesEndDateAdminTs.toMillis() < scheduledDateAdminTs.toMillis()
          ) {
            return NextResponse.json(
              {
                error:
                  "Recurring series end date cannot be before its start date",
              },
              { status: 400 },
            );
          }
          newSeriesData.endDate = seriesEndDateAdminTs.toDate(); // JS Date for model
        } catch (e: any) {
          return NextResponse.json(
            { error: e.message || "Invalid recurring end date format" },
            { status: 400 },
          );
        }
      }

      await db.runTransaction(async (transaction) => {
        transaction.set(newSeriesRef, newSeriesData);
        transaction.set(
          newSeriesRef.collection("gameIds").doc(newSeriesRef.id),
          {
            gameIds: FieldValue.arrayUnion(newSeriesRef.id),
          },
        );
      });
      newGameData.recurringSeriesId = recurringSeriesId;
    }

    const batch = db.batch();
    const gamesCollectionRef = db.collection("games");
    const newGameRef = gamesCollectionRef.doc();
    batch.set(newGameRef, newGameData);

    try {
      await batch.commit();
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
    console.error("Error in POST /api/games/create:", error.message);
    if (
      error.message.startsWith("Invalid") ||
      error.message.startsWith("Date components mismatch") ||
      error.message.startsWith("Failed to construct")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error stack:", error.stack);
    let errorMessage = "Failed to create game due to an internal error.";
    let statusCode = 500;
    // Simplified error handling, specific checks like auth/permission are done earlier
    if (error.code === "permission-denied") {
      // Example of specific Firebase error code
      errorMessage = "You don't have permission to create games in this group";
      statusCode = 403;
    }
    return NextResponse.json(
      { error: errorMessage, requestId: Date.now().toString() },
      { status: statusCode },
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "This endpoint is for POSTing new games.",
  });
}
