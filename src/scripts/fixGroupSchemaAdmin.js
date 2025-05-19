// Admin version of the fix script that bypasses security rules
const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : {
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "matchpoint-demo",
    };

// Initialize the admin SDK
let app;
try {
  // Use service account if available, otherwise use application default credentials
  if (serviceAccount.private_key) {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    app = admin.initializeApp({
      projectId: serviceAccount.projectId,
    });
  }

  console.log(
    `Initialized Firebase Admin with project: ${serviceAccount.projectId}`,
  );
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  process.exit(1);
}

// Get Firestore database
const db = admin.firestore();

// Use emulators in development
if (process.env.NODE_ENV === "development") {
  console.log("Using Firestore emulator");
  // The port should match your firebase.json config
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

/**
 * Migration script to fix group schema issues
 * This script ensures all group documents have the required fields,
 * particularly the isPublic field which is needed for security rules
 */
async function fixGroupSchema() {
  console.log("Starting group schema migration using admin SDK...");

  try {
    // Get all groups
    const groupsSnapshot = await db.collection("groups").get();

    if (groupsSnapshot.empty) {
      console.log("No groups found to migrate");
      return;
    }

    console.log(`Found ${groupsSnapshot.size} groups to check`);
    let updatedCount = 0;

    // Check each group document
    for (const groupDoc of groupsSnapshot.docs) {
      const groupData = groupDoc.data();
      const groupId = groupDoc.id;
      let needsUpdate = false;
      const updates = {};

      // Check for missing or undefined isPublic field
      if (typeof groupData.isPublic !== "boolean") {
        console.log(
          `Group ${groupId} has missing/invalid isPublic field, setting to false`,
        );
        updates.isPublic = false;
        needsUpdate = true;
      }

      // Check for missing description
      if (typeof groupData.description !== "string") {
        updates.description = "";
        needsUpdate = true;
      }

      // Check for missing location
      if (typeof groupData.location !== "string") {
        updates.location = "";
        needsUpdate = true;
      }

      // Check for missing memberCount
      if (typeof groupData.memberCount !== "number") {
        // Count actual members
        const memberDocs = await db
          .collection("groupMembers")
          .where("groupId", "==", groupId)
          .get();

        updates.memberCount = memberDocs.size || 1; // Default to 1 if no members found
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await db.collection("groups").doc(groupId).update(updates);
        updatedCount++;
        console.log(`Updated group ${groupId}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} groups.`);
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

// Execute the function
fixGroupSchema()
  .then(() => {
    console.log("Group schema migration script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
