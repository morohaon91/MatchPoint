import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebaseClient";

export class AuthService {
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async getUserClaims(
    user: User,
    forceRefresh: boolean = false,
  ): Promise<{ [key: string]: any }> {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult.claims;
  }
}
