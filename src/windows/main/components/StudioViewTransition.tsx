import type { ReactNode } from "react";

interface StudioViewTransitionProps {
  children: ReactNode;
  className?: string;
}

// viewKey lives on the React `key` in the parent — that's what remounts this
// and retriggers the CSS enter animation.
export function StudioViewTransition({
  children,
  className = "",
}: StudioViewTransitionProps) {
  return (
    <div className={`studio-view-transition ${className}`.trim()}>
      <div className="studio-view-transition__inner">{children}</div>
    </div>
  );
}
