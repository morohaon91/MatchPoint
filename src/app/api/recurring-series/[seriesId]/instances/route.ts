import { NextRequest, NextResponse } from "next/server";
import { 
  getRecurringSeries, 
  generateSeriesInstances,
  canManageGames 
} from "@/lib/services";
import { Game } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * POST /api/recurring-series/[seriesId]/instances
 * Generate game instances for a recurring series
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { seriesId: string } }
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
    
    const seriesId = params.seriesId;
    
    // Get the recurring series
    const series = await getRecurringSeries(seriesId);
    
    if (!series) {
      return NextResponse.json({ error: "Recurring series not found" }, { status: 404 });
    }
    
    // Check if the user has permission to create games in this group
    const hasPermission = await canManageGames(series.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to create games in this group" }, { status: 403 });
    }
    
    // Parse the request body
    const { templateGame, startDate, endDate } = await req.json();
    
    // Validate required fields
    if (!templateGame) {
      return NextResponse.json({ error: "Template game is required" }, { status: 400 });
    }
    
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 });
    }
    
    if (!endDate) {
      return NextResponse.json({ error: "End date is required" }, { status: 400 });
    }
    
    // Generate the game instances
    const instances = await generateSeriesInstances(
      seriesId,
      templateGame,
      new Date(startDate),
      new Date(endDate),
      userId
    );
    
    return NextResponse.json({ 
      message: `${instances.length} game instances generated successfully`,
      instances 
    });
  } catch (error: any) {
    console.error("Error generating series instances:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate series instances" }, 
      { status: 500 }
    );
  }
}
