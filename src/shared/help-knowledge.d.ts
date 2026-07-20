export const HELP_TOPICS: Array<{
  id: string;
  intents: string[];
  answer: string;
  actions: Array<{ type: string; tool?: string; phase?: string }>;
}>;

export const FAQ_TOPIC_IDS: string[];

export function getHelpTopics(locale: "en" | "es"): typeof HELP_TOPICS;

export function getHelpTopicById(
  topicId: string,
  locale?: "en" | "es",
): (typeof HELP_TOPICS)[number] | null;

export const SUGGESTED_QUESTIONS: string[];
export const SUGGESTED_QUESTIONS_ES: string[];

export const BREAK_RULES_COPY: {
  pageTitle: string;
  label: string;
  close: string;
  closeAria: string;
  workedCol: string;
  breakCol: string;
  title: string;
  intro: string;
  rows: Array<{ worked: string; break: string }>;
};
