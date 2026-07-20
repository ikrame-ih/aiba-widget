import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAppData } from "../hooks/useAppData";

type AppDataContextValue = ReturnType<typeof useAppData>;

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useAppData();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppDataContext() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppDataContext must be used within AppDataProvider");
  }
  return ctx;
}
