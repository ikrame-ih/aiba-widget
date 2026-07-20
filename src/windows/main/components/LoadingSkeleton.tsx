interface LoadingSkeletonProps {
  label: string;
}

export function LoadingSkeleton({ label }: LoadingSkeletonProps) {
  return (
    <div className="loading-skeleton" aria-busy="true" aria-label={label}>
      <div className="loading-skeleton__ring" aria-hidden="true" />
      <div className="loading-skeleton__bar loading-skeleton__bar--lg" aria-hidden="true" />
      <div className="loading-skeleton__bar loading-skeleton__bar--md" aria-hidden="true" />
      <div className="loading-skeleton__bar loading-skeleton__bar--sm" aria-hidden="true" />
      <p className="loading-skeleton__label">{label}</p>
    </div>
  );
}
