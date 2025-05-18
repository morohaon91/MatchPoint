import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateSportsPreferences } from "@/lib/services";
import { SportType } from "@/lib/types/models";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/users/profile/sports
 * Get the current user's sports preferences
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
    
    // Get the user profile
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    
    return NextResponse.json({ sportsPreferences: profile.sportsPreferences || [] });
  } catch (error: any) {
    console.error("Error getting sports preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get sports preferences" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile/sports
 * Update the current user's sports preferences
 */
export async function PUT(req: NextRequest) {
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
    const { sportsPreferences } = await req.json();
    
    if (!Array.isArray(sportsPreferences)) {
      return NextResponse.json(
        { error: "Sports preferences must be an array" }, 
        { status: 400 }
      );
    }
    
    // Validate each sport type
    for (const sport of sportsPreferences) {
      if (!Object.values(SportType).includes(sport as SportType)) {
        return NextResponse.json(
          { error: `Invalid sport type: ${sport}` }, 
          { status: 400 }
        );
      }
    }
    
    // Update the sports preferences
    await updateSportsPreferences(userId, sportsPreferences as SportType[]);
    
    return NextResponse.json({ 
      message: "Sports preferences updated successfully",
      sportsPreferences
    });
  } catch (error: any) {
    console.error("Error updating sports preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update sports preferences" }, 
      { status: 500 }
    );
  }
}
