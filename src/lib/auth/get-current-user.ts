import { NextRequest } from "next/server";
import { initializeAdmin } from "@/lib/firebase/firebaseAdmin";

const admin = initializeAdmin();

/**
 * Gets the current authenticated user from a request
 * @param req The Next.js request object
 * @returns The user object with uid if authenticated, null otherwise
 */
export async function getCurrentUser(req: NextRequest) {
  try {
    // Get the authorization token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token and get the user ID
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      // Add any other user properties you need from the token
    };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}
