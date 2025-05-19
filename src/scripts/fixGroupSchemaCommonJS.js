// CommonJS version of the group schema fix script to avoid ES module issues
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  connectFirestoreEmulator,
} = require("firebase/firestore");

// Load environment variables from .env file
require("dotenv").config();

// Initialize Firebase directly in this script
const clientCredentials = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBOti4mM-6x9WDnZIjIeyEU_U-Clg-f_oM", // Using the Firebase demo project as fallback
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "matchpoint-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "matchpoint-demo",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "matchpoint-demo.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:123456789012:web:a123456789012345678901",
};

console.log("Using project ID:", clientCredentials.projectId);

// Initialize Firebase
const app = initializeApp(clientCredentials);
const db = getFirestore(app);

// Connect to emulators in development environment
if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 8080);
  console.log("Connected to Firestore emulator");
}

/**
 * Migration script to fix group schema issues
 * This script ensures all group documents have the required fields,
 * particularly the isPublic field which is needed for security rules
 */
async function fixGroupSchema() {
  console.log("Starting group schema migration...");

  try {
    // Get all groups
    const groupsSnapshot = await getDocs(collection(db, "groups"));

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
        const memberQuery = collection(db, "groupMembers");
        const memberDocs = await getDocs(memberQuery);
        const memberCount = memberDocs.docs.filter(
          (doc) => doc.data().groupId === groupId,
        ).length;

        updates.memberCount = memberCount || 1; // Default to 1 if no members found
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await updateDoc(doc(db, "groups", groupId), updates);
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
