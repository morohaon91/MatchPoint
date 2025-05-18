import { NextRequest, NextResponse } from "next/server";
import { 
  createRecurringSeries, 
  getGroupRecurringSeries, 
  canManageGames 
} from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * POST /api/recurring-series
 * Create a new recurring series
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
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the request body
    const seriesData = await req.json();
    
    // Validate required fields
    if (!seriesData.groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    if (!seriesData.frequency) {
      return NextResponse.json({ error: "Frequency is required" }, { status: 400 });
    }
    
    if (!seriesData.startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }
    
    if (!seriesData.timeOfDay) {
      return NextResponse.json({ error: "Time of day is required" }, { status: 400 });
    }
    
    // Check if the user has permission to create games in this group
    const hasPermission = await canManageGames(seriesData.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to create games in this group" }, { status: 403 });
    }
    
    // Create the recurring series
    const newSeries = await createRecurringSeries(seriesData, userId);
    
    return NextResponse.json({ series: newSeries });
  } catch (error: any) {
    console.error("Error creating recurring series:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create recurring series" }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/recurring-series
 * Get recurring series for a group
 */
export async function GET(req: NextRequest) {
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
    
    // Get the group ID from the query parameters
    const url = new URL(req.url);
    const groupId = url.searchParams.get("groupId");
    
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }
    
    // Get the recurring series for the group
    const series = await getGroupRecurringSeries(groupId);
    
    return NextResponse.json({ series });
  } catch (error: any) {
    console.error("Error getting recurring series:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get recurring series" }, 
      { status: 500 }
    );
  }
}
