import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppLocale } from "../types/app";
import { getCopy } from "../../../shared/copy.js";
import type { CopyShape } from "../../../shared/copy.d.ts";

const CopyContext = createContext<CopyShape>(getCopy("en"));

interface CopyProviderProps {
  locale: AppLocale;
  children: ReactNode;
}

export function CopyProvider({ locale, children }: CopyProviderProps) {
  const value = useMemo(() => getCopy(locale), [locale]);
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

export function useCopy() {
  return useContext(CopyContext);
}
