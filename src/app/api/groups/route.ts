import { NextRequest, NextResponse } from "next/server";
import {
  createGroup,
  getUserGroups,
  getPublicGroups,
} from "@/lib/services";
import { getUserGroupsAsAdmin } from "@/lib/groups/groupAdminService";
import { Group, SportType } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

// Initialize Firebase Admin
const admin = initializeAdmin();
const auth = admin.auth();

/**
 * GET /api/groups
 * Get groups based on query parameters
 * - type: 'my' for user's groups, 'public' for public groups
 * - sport: optional sport type filter
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "public";
    const sport = url.searchParams.get("sport") as SportType | null;

    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];

      // Verify the token and get the user ID
      try {
        const decodedToken = await auth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Error verifying token:", error);

        // If type is 'my', we need a valid user ID
        if (type === "my") {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }
      }
    } else if (type === "my") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let groups: Group[] = [];

    try {
      if (type === "my") {
        // Use the Admin SDK version for server-side fetching
        groups = await getUserGroupsAsAdmin(userId);

        // Filter by sport if specified
        if (sport) {
          groups = groups.filter((group) => group.sport === sport);
        }
      } else {
        // Call getPublicGroups without arguments as it doesn't accept any
        groups = await getPublicGroups();
        
        // Filter by sport if specified
        if (sport) {
          groups = groups.filter((group) => group.sport === sport);
        }
      }

      return NextResponse.json({
        groups,
        debug: {
          userAuthenticated: !!userId,
          requestedType: type,
          sportFilter: sport || "none",
          groupsFound: groups.length,
        },
      });
    } catch (fetchError: any) {
      console.error(`Error fetching ${type} groups:`, fetchError);
      return NextResponse.json({
        groups: [],
        error: fetchError.message || `Error fetching ${type} groups`,
        debug: {
          userAuthenticated: !!userId,
          requestedType: type,
          sportFilter: sport || "none",
          errorCode: fetchError.code,
        },
      });
    }
  } catch (error: any) {
    console.error("Error getting groups:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get groups" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
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
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse the request body
    const groupData = await req.json();

    // Validate required fields
    if (!groupData.name || !groupData.sport) {
      return NextResponse.json(
        { error: "Name and sport are required" },
        { status: 400 },
      );
    }

    // Create the group
    const group = await createGroup(groupData, userId);

    return NextResponse.json({ group });
  } catch (error: any) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create group" },
      { status: 500 },
    );
  }
}
