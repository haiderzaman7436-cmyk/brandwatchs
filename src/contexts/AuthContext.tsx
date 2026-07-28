import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = "admin@brandwatches.com"; // TODO: Replace with your admin email

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;

  // Email/password
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Google
  loginWithGoogle: () => Promise<User>;

  // Phone OTP
  sendPhoneOtp: (
    phoneNumber: string,
    recaptchaContainerId: string
  ) => Promise<ConfirmationResult>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // Save user info to Firestore users collection
      if (u) {
        try {
          await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || "",
            photoURL: u.photoURL || "",
            phoneNumber: u.phoneNumber || "",
            provider: u.providerData?.[0]?.providerId || "email",
            lastLogin: new Date().toISOString(),
            createdAt: u.metadata.creationTime || new Date().toISOString(),
          }, { merge: true }); // merge:true so we don't overwrite existing data
        } catch (e) {
          console.error("Error saving user to Firestore:", e);
        }
      }
    });
    return unsub;
  }, []);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  // -------------------------
  // Email / Password Login
  // -------------------------
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // -------------------------
  // Forgot Password
  // -------------------------
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // -------------------------
  // Google Login
  // -------------------------
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const res = await signInWithPopup(auth, provider);
    return res.user;
  };

  // -------------------------
  // Phone OTP
  // -------------------------
  const sendPhoneOtp = async (
    phoneNumber: string,
    recaptchaContainerId: string
  ) => {
    const w = window as any;

    if (!w.recaptchaVerifier) {
      w.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerId,
        { size: "invisible" }
      );
    }

    const confirmation = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      w.recaptchaVerifier
    );

    return confirmation;
  };

  // -------------------------
  // Logout
  // -------------------------
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        signup,
        resetPassword,
        loginWithGoogle,
        sendPhoneOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};