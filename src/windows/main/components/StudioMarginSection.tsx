import type { ReactNode } from "react";

interface StudioMarginSectionProps {
  kanji: string;
  label: string;
  action?: ReactNode;
  children: ReactNode;
  /** Optional id for scroll targets (e.g. Ask Aiba → History) */
  sectionId?: string;
}

export function StudioMarginSection({
  kanji,
  label,
  action,
  children,
  sectionId,
}: StudioMarginSectionProps) {
  return (
    <section
      aria-label={label}
      className="studio-margin-section"
      data-studio-section={sectionId}
    >
      <div className="studio-margin-section__head">
        <h2 className="studio-margin-section__title">
          <span className="studio-margin-section__kanji" aria-hidden="true">
            {kanji}
          </span>
          <span className="studio-margin-section__label">{label}</span>
        </h2>
        {action ? <div className="studio-margin-section__action">{action}</div> : null}
      </div>
      <div className="studio-margin-section__content">{children}</div>
    </section>
  );
}
