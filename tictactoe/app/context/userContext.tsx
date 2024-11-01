// app/context/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../utils/supabase/supabaseClient";
import { User } from "@supabase/supabase-js";

const UserContext = createContext<User | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const signInAnonymously = async () => {
      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        return;
      }

      if (session && session.user) {
        // User is already signed in
        setUser(session.user);
      } else {
        // Sign in anonymously
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error("Error during anonymous sign-in:", error);
          return;
        }

        if (data && data.user) {
          setUser(data.user);
        }
      }
    };

    signInAnonymously();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
