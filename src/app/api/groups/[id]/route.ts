import { NextResponse } from "next/server";
import { getGroupById } from "@/lib/groups/groupService";
// import { auth } from '@/lib/firebase/firebaseAdmin'; // For server-side auth if needed

interface Params {
  id: string;
}

export async function GET(request: Request, context: { params: Params }) {
  const groupId = context.params.id;

  // Optional: Verify user authentication if needed at API level,
  // though Firestore rules should also enforce this.
  // const authorization = request.headers.get('Authorization');
  // if (authorization?.startsWith('Bearer ')) {
  //   const idToken = authorization.split('Bearer ')[1];
  //   try {
  //     const decodedToken = await auth().verifyIdToken(idToken);
  //     // console.log('Authenticated user UID:', decodedToken.uid);
  //   } catch (error) {
  //     console.error('Error verifying auth token:', error);
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }
  // } else {
  //   return NextResponse.json({ error: 'Unauthorized, no token provided' }, { status: 401 });
  // }

  if (!groupId) {
    return NextResponse.json(
      { error: "Group ID is required" },
      { status: 400 },
    );
  }

  try {
    const group = await getGroupById(groupId);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Firestore rules should handle whether the authenticated user can access this group.
    // If additional checks are needed (e.g. user is member of private group), they can be added here.
    return NextResponse.json({ group }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching group ${groupId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch group details", details: errorMessage },
      { status: 500 },
    );
  }
}
