interface EnsoProgressProps {
  progress: number;
  label: string;
  reducedMotion?: boolean;
  variant?: "default" | "studio" | "compact";
  kanji?: string;
  showKanji?: boolean;
  studioSize?: number;
}

const DEFAULT_SIZE = 140;
const DEFAULT_STROKE = 5;
const DEFAULT_RADIUS = (DEFAULT_SIZE - DEFAULT_STROKE * 2) / 2;

const STUDIO_RADIUS = 104;
const STUDIO_GAP = 0.07;

const COMPACT_SIZE = 96;
const COMPACT_STROKE = 4;
const COMPACT_RADIUS = (COMPACT_SIZE - COMPACT_STROKE * 2) / 2;

export function EnsoProgress({
  progress,
  label,
  reducedMotion = false,
  variant = "default",
  kanji = "集中",
  showKanji = true,
  studioSize = 252,
}: EnsoProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  if (variant === "compact") {
    const circumference = 2 * Math.PI * COMPACT_RADIUS;
    const arcLength = circumference * 0.92;
    const filled = (clamped / 100) * arcLength;
    const offset = arcLength - filled;

    return (
      <div
        className={`enso-progress enso-progress--compact ${reducedMotion ? "is-reduced" : ""}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={label}
      >
        <svg
          className="enso-progress__ring"
          viewBox={`0 0 ${COMPACT_SIZE} ${COMPACT_SIZE}`}
          width={COMPACT_SIZE}
          height={COMPACT_SIZE}
          aria-hidden="true"
        >
          <circle
            className="enso-progress__track"
            cx={COMPACT_SIZE / 2}
            cy={COMPACT_SIZE / 2}
            r={COMPACT_RADIUS}
            fill="none"
            strokeWidth={COMPACT_STROKE}
          />
          <circle
            className="enso-progress__fill"
            cx={COMPACT_SIZE / 2}
            cy={COMPACT_SIZE / 2}
            r={COMPACT_RADIUS}
            fill="none"
            strokeWidth={COMPACT_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${COMPACT_SIZE / 2} ${COMPACT_SIZE / 2})`}
          />
        </svg>
        <div className="enso-progress__label">{label}</div>
      </div>
    );
  }

  if (variant === "studio") {
    const size = studioSize;
    const center = size / 2;
    const radius = (size / 252) * 102;
    const radiusSecondary = (size / 252) * 100.5;
    const strokeTrack = (size / 252) * 3;
    const strokePrimary = (size / 252) * 5;
    const strokeSecondary = (size / 252) * 2;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * (1 - STUDIO_GAP);
    const progressLength = arcLength * (clamped / 100);
    const timeFontSize = Math.round((size / 252) * 42);
    const kanjiFontSize = Math.round((size / 252) * 11);
    const filterId = size === 252 ? "enso-ink" : `enso-ink-${size}`;

    return (
      <div
        className={`enso-progress enso-progress--studio ${reducedMotion ? "is-reduced" : ""}`}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={label}
      >
        <svg
          className="enso-progress__ring"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          aria-hidden="true"
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.05"
                numOctaves={2}
                seed={7}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={5}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <circle
            className="enso-progress__track"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeTrack}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-64 ${center} ${center})`}
            filter={`url(#${filterId})`}
          />
          <circle
            className="enso-progress__fill enso-progress__fill--primary"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokePrimary}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference}`}
            transform={`rotate(-64 ${center} ${center})`}
            filter={`url(#${filterId})`}
          />
          <circle
            className="enso-progress__fill enso-progress__fill--secondary"
            cx={center}
            cy={center}
            r={radiusSecondary}
            fill="none"
            strokeWidth={strokeSecondary}
            strokeLinecap="round"
            strokeDasharray={`${progressLength * 0.85} ${circumference}`}
            transform={`rotate(-64 ${center} ${center})`}
            filter={`url(#${filterId})`}
          />
        </svg>
        <div className="enso-progress__label">
          <span className="enso-progress__time" style={{ fontSize: timeFontSize }}>
            {label}
          </span>
          {showKanji && (
            <span
              className="enso-progress__kanji"
              style={{ fontSize: kanjiFontSize }}
              aria-hidden="true"
            >
              {kanji}
            </span>
          )}
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * DEFAULT_RADIUS;
  const arcLength = circumference * 0.92;
  const filled = (clamped / 100) * arcLength;
  const offset = arcLength - filled;

  return (
    <div
      className={`enso-progress ${reducedMotion ? "is-reduced" : ""}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label}
    >
      <svg
        className="enso-progress__ring"
        viewBox={`0 0 ${DEFAULT_SIZE} ${DEFAULT_SIZE}`}
        width={DEFAULT_SIZE}
        height={DEFAULT_SIZE}
        aria-hidden="true"
      >
        <circle
          className="enso-progress__track"
          cx={DEFAULT_SIZE / 2}
          cy={DEFAULT_SIZE / 2}
          r={DEFAULT_RADIUS}
          fill="none"
          strokeWidth={DEFAULT_STROKE}
        />
        <circle
          className="enso-progress__fill"
          cx={DEFAULT_SIZE / 2}
          cy={DEFAULT_SIZE / 2}
          r={DEFAULT_RADIUS}
          fill="none"
          strokeWidth={DEFAULT_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${DEFAULT_SIZE / 2} ${DEFAULT_SIZE / 2})`}
        />
      </svg>
      <div className="enso-progress__label">{label}</div>
    </div>
  );
}
