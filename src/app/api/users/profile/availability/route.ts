import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateAvailability } from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/users/profile/availability
 * Get the current user's availability settings
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
    
    return NextResponse.json({ 
      availability: profile.availability || {
        morning: false,
        afternoon: false,
        evening: false,
        weekend: false
      }
    });
  } catch (error: any) {
    console.error("Error getting availability settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get availability settings" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile/availability
 * Update the current user's availability settings
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
    const { availability } = await req.json();
    
    if (typeof availability !== 'object' || availability === null) {
      return NextResponse.json(
        { error: "Availability must be an object" }, 
        { status: 400 }
      );
    }
    
    // Validate availability fields
    const validFields = ['morning', 'afternoon', 'evening', 'weekend'];
    for (const key in availability) {
      if (!validFields.includes(key)) {
        return NextResponse.json(
          { error: `Invalid availability field: ${key}` }, 
          { status: 400 }
        );
      }
      
      if (typeof availability[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Availability field ${key} must be a boolean` }, 
          { status: 400 }
        );
      }
    }
    
    // Update the availability settings
    await updateAvailability(userId, availability);
    
    return NextResponse.json({ 
      message: "Availability settings updated successfully",
      availability
    });
  } catch (error: any) {
    console.error("Error updating availability settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update availability settings" }, 
      { status: 500 }
    );
  }
}
