import { NextRequest, NextResponse } from "next/server";
import { 
  getRecurringSeries, 
  updateRecurringSeries, 
  deleteRecurringSeries, 
  getSeriesInstances,
  updateFutureSeriesInstances,
  generateSeriesInstances,
  canManageGames 
} from "@/lib/services";
import { Game } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/recurring-series/[seriesId]
 * Get a recurring series by ID
 */
export async function GET(
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
    
    // Check if the URL has includeInstances parameter
    const url = new URL(req.url);
    const includeInstances = url.searchParams.get("includeInstances") === "true";
    const includeCompleted = url.searchParams.get("includeCompleted") === "true";
    
    // If includeInstances is true, get the game instances for this series
    let instances: Game[] = [];
    if (includeInstances) {
      instances = await getSeriesInstances(seriesId, includeCompleted);
    }
    
    return NextResponse.json({ 
      series,
      instances: includeInstances ? instances : undefined
    });
  } catch (error: any) {
    console.error("Error getting recurring series:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get recurring series" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recurring-series/[seriesId]
 * Update a recurring series
 */
export async function PUT(
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
    
    // Check if the user has permission to update this series
    const hasPermission = await canManageGames(series.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to update this series" }, { status: 403 });
    }
    
    // Parse the request body
    const { seriesData, updateInstances } = await req.json();
    
    // Update the recurring series
    await updateRecurringSeries(seriesId, seriesData);
    
    // If updateInstances is true, update all future game instances
    if (updateInstances) {
      // Extract game-specific fields from seriesData
      const { 
        title, 
        description, 
        location, 
        maxParticipants 
      } = seriesData;
      
      // Only update fields that are relevant to game instances
      const gameUpdateData: any = {};
      if (title !== undefined) gameUpdateData.title = title;
      if (description !== undefined) gameUpdateData.description = description;
      if (location !== undefined) gameUpdateData.location = location;
      if (maxParticipants !== undefined) gameUpdateData.maxParticipants = maxParticipants;
      
      // Only update if there are fields to update
      if (Object.keys(gameUpdateData).length > 0) {
        await updateFutureSeriesInstances(seriesId, gameUpdateData);
      }
    }
    
    // Get the updated series
    const updatedSeries = await getRecurringSeries(seriesId);
    
    return NextResponse.json({ series: updatedSeries });
  } catch (error: any) {
    console.error("Error updating recurring series:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update recurring series" }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recurring-series/[seriesId]
 * Delete a recurring series
 */
export async function DELETE(
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
    
    // Check if the user has permission to delete this series
    const hasPermission = await canManageGames(series.groupId, userId);
    
    if (!hasPermission) {
      return NextResponse.json({ error: "You don't have permission to delete this series" }, { status: 403 });
    }
    
    // Check if the URL has deleteInstances parameter
    const url = new URL(req.url);
    const deleteInstances = url.searchParams.get("deleteInstances") === "true";
    
    // Delete the recurring series
    await deleteRecurringSeries(seriesId, deleteInstances);
    
    return NextResponse.json({ message: "Recurring series deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting recurring series:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete recurring series" }, 
      { status: 500 }
    );
  }
}
