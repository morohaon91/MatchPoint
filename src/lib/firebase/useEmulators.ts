import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectFunctionsEmulator } from "firebase/functions";
import { auth, db, functions } from "./firebaseClient";

export function connectToEmulators() {
  if (process.env.NODE_ENV === 'development') {
    try {
      connectAuthEmulator(auth, "http://localhost:9099");
      connectFirestoreEmulator(db, "localhost", 8080);
      connectFunctionsEmulator(functions, "localhost", 5001);
      console.log("Connected to Firebase emulators");
    } catch (error) {
      console.error("Error connecting to emulators:", error);
    }
  }
}
