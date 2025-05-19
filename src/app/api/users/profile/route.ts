import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateLocation } from "@/lib/services";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * GET /api/users/profile
 * Get the current user's profile
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
    
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user profile" }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Update the current user's profile
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
    const { name, photoURL, location } = await req.json();
    
    // Update the user profile
    // Update location if provided
    if (location) {
      await updateLocation(userId, location);
    }
    
    // Update name and photoURL if provided
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    
    if (Object.keys(updateData).length > 0) {
      await admin.firestore().collection("users").doc(userId).update(updateData);
    }
    
    // Get the updated profile
    const updatedProfile = await getUserProfile(userId);
    
    return NextResponse.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user profile" }, 
      { status: 500 }
    );
  }
}
