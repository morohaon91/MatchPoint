import { NextResponse } from "next/server";
import { getGroupMembers } from "@/lib/groups/groupService";
// import { auth } from '@/lib/firebase/firebaseAdmin'; // For server-side auth if needed

interface Params {
  id: string; // This will be the groupId from the dynamic segment [id]
}

export async function GET(request: Request, context: { params: Params }) {
  const groupId = context.params.id;

  // Optional: Verify user authentication if needed at API level.
  // Firestore rules should primarily handle authorization for fetching members.
  // const authorization = request.headers.get('Authorization');
  // if (authorization?.startsWith('Bearer ')) {
  //   const idToken = authorization.split('Bearer ')[1];
  //   try {
  //     const decodedToken = await auth().verifyIdToken(idToken);
  //     // console.log('Authenticated user UID for members fetch:', decodedToken.uid);
  //     // Add logic here: e.g., check if decodedToken.uid is a member or admin of groupId
  //   } catch (error) {
  //     console.error('Error verifying auth token for members fetch:', error);
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  //   }
  // } else {
  //   return NextResponse.json({ error: 'Unauthorized, no token provided for members fetch' }, { status: 401 });
  // }

  if (!groupId) {
    return NextResponse.json(
      { error: "Group ID is required to fetch members" },
      { status: 400 },
    );
  }

  try {
    const members = await getGroupMembers(groupId);

    // Firestore rules should handle whether the authenticated user can list members.
    // If members array is empty, it could be due to no members or lack of permission by rules.
    // The service function getGroupMembers itself doesn't check permissions, relies on rules.
    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch group members", details: errorMessage },
      { status: 500 },
    );
  }
}
