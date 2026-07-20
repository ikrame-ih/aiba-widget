export function normalizeQuery(text: string): string;

export function resolveHelpQuery(
  query: string,
  context?: {
    timeMode?: string;
    activeTool?: string;
    sessionStatus?: string;
  },
): {
  matched: boolean;
  answer: string;
  topicId: string | null;
  actions: Array<{ type: string; tool?: string; phase?: string }>;
  suggestions: string[];
  confidence: number;
};

export { HELP_TOPICS } from "./help-knowledge.js";
