import { useState } from "react";
import { getHelpTopicById } from "../../../shared/help-knowledge.js";
import { useCopy } from "../context/CopyContext";
import type { AppLocale } from "../types/app";
import type { HelpResult } from "../hooks/useHelp";
import type { StudioTool } from "./ExpandedWidget";

interface AskAibaProps {
  locale: AppLocale;
  onAction?: (action: HelpResult["actions"][number]) => void;
}

export function AskAiba({ locale, onAction }: AskAibaProps) {
  const copy = useCopy();
  const [openId, setOpenId] = useState<string | null>(null);

  const toolLabels: Record<StudioTool, string> = {
    today: copy.studio.phaseHeader.morning,
    notes: copy.studio.notesLabel,
    // Sessions live under Plan → History (no separate tool screen)
    sessions: copy.studio.sections.history.label,
    preferences: copy.nav.preferences,
  };

  const phaseLabels: Record<"morning" | "afternoon" | "evening", string> = {
    morning: copy.studio.phaseHeader.morning,
    afternoon: copy.studio.phaseHeader.afternoon,
    evening: copy.studio.phaseHeader.evening,
  };

  const actionLabel = (action: HelpResult["actions"][number]): string => {
    if (action.type === "switch-phase" && action.phase) {
      return copy.ask.openTool(phaseLabels[action.phase] ?? action.phase);
    }
    if (action.type === "switch-tool" && action.tool) {
      return copy.ask.openTool(toolLabels[action.tool] ?? action.tool);
    }
    if (action.type === "start-focus") return `${copy.actions.startFocus} →`;
    if (action.type === "expand") return `${copy.expand} →`;
    if (action.type === "collapse") return `${copy.minimize} →`;
    if (action.type === "open-help") return copy.ask.openHelp;
    return `${copy.actions.goThere} →`;
  };

  const toggleFaq = (topicId: string) => {
    setOpenId((current) => (current === topicId ? null : topicId));
  };

  return (
    <section
      className="ask-aiba ask-aiba--sidebar"
      aria-label={copy.askAiba}
      data-exclude-roam
    >
      <div className="ask-aiba__header">
        <h3 className="ask-aiba__title">{copy.askAiba}</h3>
      </div>

      <p className="ask-aiba__intro">{copy.ask.intro}</p>

      <div className="ask-aiba__faq" role="list">
        {copy.ask.faqs.map(({ id, question }) => {
          const topic = getHelpTopicById(id, locale);
          const isOpen = openId === id;

          return (
            <div
              key={id}
              className={`ask-aiba__faq-item ${isOpen ? "is-open" : ""}`}
              role="listitem"
            >
              <button
                type="button"
                className="ask-aiba__faq-trigger"
                aria-expanded={isOpen}
                onClick={() => toggleFaq(id)}
              >
                <span>{question}</span>
                <span className="ask-aiba__faq-icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && topic && (
                <div className="ask-aiba__answer" aria-live="polite">
                  <p>{topic.answer}</p>
                  {topic.actions.length > 0 && (
                    <div className="ask-aiba__actions">
                      {topic.actions.map((action) => (
                        <button
                          key={`${action.type}-${action.tool ?? action.phase ?? "none"}`}
                          type="button"
                          className="text-action"
                          onClick={() =>
                            onAction?.(action as HelpResult["actions"][number])
                          }
                        >
                          {actionLabel(action as HelpResult["actions"][number])}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
