import { CopyProvider } from "./context/CopyContext";
import { ToastProvider } from "./context/ToastContext";
import { AppDataProvider, useAppDataContext } from "./context/AppDataContext";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { getCopy } from "../../shared/copy.js";
import { AppShell } from "./AppShell";

export function App() {
  return (
    <AppDataProvider>
      <AppRoot />
    </AppDataProvider>
  );
}

function AppRoot() {
  const { data, ready } = useAppDataContext();
  const locale = data.settings.language;

  if (!ready) {
    return (
      <div className="loading-screen">
        <LoadingSkeleton label={getCopy(locale).loading} />
      </div>
    );
  }

  return (
    <CopyProvider locale={locale}>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </CopyProvider>
  );
}
