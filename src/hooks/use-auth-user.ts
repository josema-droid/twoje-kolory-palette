import { useEffect, useState } from "react";
import { onAuthChange, type AuthUser } from "@/lib/api";

// undefined = session not resolved yet (and always during SSR).
export function useAuthUser(): AuthUser | null | undefined {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => onAuthChange(setUser), []);
  return user;
}
