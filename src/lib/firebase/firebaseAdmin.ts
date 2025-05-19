import admin from "firebase-admin";

/**
 * Initializes the Firebase Admin SDK. (SHOULD ONLY BE USED IN SERVER SIDE)
 *
 * This function initializes the Firebase Admin SDK with the provided credentials.
 * It is used to interact with Firebase services from a server environment.
 *
 * @returns {admin.app.App} The initialized Firebase Admin app
 */
export const initializeAdmin = () => {
  if (!admin.apps.length) {
    try {
      // Use different initialization based on environment
      if (process.env.NODE_ENV === "development") {
        // In development, use a simple initialization that works with emulators
        // The projectId is the only required field for emulator usage
        admin.initializeApp({
          projectId:
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "matchpoint-c6d86",
        });

        // Set FIREBASE_AUTH_EMULATOR_HOST to ensure auth emulator is used
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
        // Set FIRESTORE_EMULATOR_HOST to ensure firestore emulator is used
        process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

        console.log(
          "Firebase Admin Initialized in development mode (using emulators)"
        );
      } else {
        // In production, use the full credential setup
        if (
          !process.env.FIREBASE_CLIENT_EMAIL ||
          !process.env.FIREBASE_PRIVATE_KEY
        ) {
          throw new Error(
            "Missing Firebase Admin credentials. FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set in production."
          );
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.log("Firebase Admin Initialized in production mode");
      }
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  }
  return admin;
};
