import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api";

// undefined = session not resolved yet (and always during SSR).
export function useAuthUser(): AuthUser | null | undefined {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => {
    // Loaded on demand: the Supabase client is large and isn't needed to paint the page.
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/api").then(({ onAuthChange }) => {
      if (!cancelled) unsubscribe = onAuthChange(setUser);
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
  return user;
}
