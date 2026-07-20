import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_DATA, migrateData, createId } from "../../../shared/data-schema.js";
import type { AppData, Priority, WidgetMode } from "../types/app";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    const initial = clone(DEFAULT_DATA);
    const nativeMode = window.api?.initialWidgetMode?.mode;
    if (nativeMode) initial.widgetMode = nativeMode;
    return initial;
  });
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const raw = window.api ? await window.api.loadData() : null;
        const migrated = migrateData(raw) as AppData;
        const nativeMode = await window.api?.getWidgetMode();
        if (nativeMode?.mode) migrated.widgetMode = nativeMode.mode;
        setData(migrated);
      } catch {
        const fallback = clone(DEFAULT_DATA);
        const nativeMode = window.api?.initialWidgetMode?.mode;
        if (nativeMode) fallback.widgetMode = nativeMode;
        setData(fallback);
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  const persist = useCallback((next: AppData) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      window.api?.saveData(next);
    }, 400);
  }, []);

  const update = useCallback(
    (mutator: (draft: AppData) => void) => {
      setData((prev) => {
        const draft = clone(prev);
        mutator(draft);
        persist(draft);
        return draft;
      });
    },
    [persist],
  );

  const setTimeMode = useCallback(
    (mode: AppData["settings"]["timeMode"]) => {
      update((draft) => {
        draft.settings.timeMode = mode;
      });
    },
    [update],
  );

  const setWidgetMode = useCallback(
    async (mode: WidgetMode) => {
      const result = await window.api?.setWidgetMode(mode);
      const appliedMode = result?.mode ?? mode;
      update((draft) => {
        draft.widgetMode = appliedMode;
      });
    },
    [update],
  );

  useEffect(() => {
    return window.api?.onWidgetModeChanged((result) => {
      update((draft) => {
        draft.widgetMode = result.mode;
      });
    });
  }, [update]);

  const addPriority = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      update((draft) => {
        if (draft.priorities.length >= 3) return;
        draft.priorities.push({ id: createId(), text: trimmed, done: false });
        if (!draft.primaryTaskId) draft.primaryTaskId = draft.priorities[0]?.id ?? null;
        if (!draft.onboardingSeen.firstTask) draft.onboardingSeen.firstTask = true;
      });
      return true;
    },
    [update],
  );

  const togglePriority = useCallback(
    (id: string) => {
      update((draft) => {
        const item = draft.priorities.find((p) => p.id === id);
        if (!item) return;
        item.done = !item.done;
      });
    },
    [update],
  );

  const removePriority = useCallback(
    (id: string) => {
      update((draft) => {
        draft.priorities = draft.priorities.filter((p) => p.id !== id);
        if (draft.primaryTaskId === id) {
          draft.primaryTaskId = draft.priorities.find((p) => !p.done)?.id ?? null;
        }
      });
    },
    [update],
  );

  const updatePriority = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      update((draft) => {
        const item = draft.priorities.find((p) => p.id === id);
        if (!item) return;
        item.text = trimmed.slice(0, 80);
      });
      return true;
    },
    [update],
  );

  const setPrimaryTask = useCallback(
    (id: string | null) => {
      update((draft) => {
        draft.primaryTaskId = id;
      });
    },
    [update],
  );

  const primaryTask = useMemo(() => {
    const byId = data.priorities.find((p) => p.id === data.primaryTaskId && !p.done);
    return byId || data.priorities.find((p) => !p.done) || null;
  }, [data.primaryTaskId, data.priorities]);

  const completedCount = useMemo(
    () => data.priorities.filter((p: Priority) => p.done).length,
    [data.priorities],
  );

  const clearCompleted = useCallback(() => {
    update((draft) => {
      draft.priorities = draft.priorities.filter((p) => !p.done);
      if (draft.primaryTaskId && !draft.priorities.find((p) => p.id === draft.primaryTaskId)) {
        draft.primaryTaskId = draft.priorities.find((p) => !p.done)?.id ?? null;
      }
    });
  }, [update]);

  return {
    data,
    ready,
    update,
    setTimeMode,
    setWidgetMode,
    addPriority,
    togglePriority,
    removePriority,
    updatePriority,
    setPrimaryTask,
    clearCompleted,
    primaryTask,
    completedCount,
  };
}
