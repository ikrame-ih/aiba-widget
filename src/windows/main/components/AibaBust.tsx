import type { AibaBehavior } from "../hooks/useAibaBehavior";
import type { AibaMood } from "../types/app";

interface AibaBustProps {
  mood: AibaMood;
  behavior?: AibaBehavior;
  reducedMotion?: boolean;
  variant?: "default" | "studio";
}

const DEFAULT_VIEWBOX = "48 6 144 218";
const STUDIO_VIEWBOX = "30 -4 180 252";

const EYE_OPEN: Record<AibaMood, { left: string; right: string; drowsy?: boolean }> = {
  bright: {
    left: "M 78 159 Q 89 154 100 159",
    right: "M 140 159 Q 151 154 162 159",
  },
  focused: {
    left: "M 78 160 Q 89 162 100 160",
    right: "M 140 160 Q 151 162 162 160",
  },
  drowsy: {
    left: "M 78 160 Q 89 166 100 160",
    right: "M 140 160 Q 151 166 162 160",
    drowsy: true,
  },
};

const BROW_PATHS: Record<AibaMood, { left: string; right: string }> = {
  bright: {
    left: "M 74 141 Q 89 137 104 141",
    right: "M 136 141 Q 151 137 166 141",
  },
  focused: {
    left: "M 74 141 Q 89 139 104 141",
    right: "M 136 141 Q 151 139 166 141",
  },
  drowsy: {
    left: "M 74 142 Q 89 140 104 142",
    right: "M 136 142 Q 151 140 166 142",
  },
};

const MOUTH_PATHS: Record<AibaMood, { line: string; lips?: string }> = {
  bright: {
    line: "M 112 194 Q 120 198 128 194",
    lips: "M 113 195 Q 120 197 127 195 Q 120 201 113 195 Z",
  },
  focused: {
    line: "M 114 194 L 126 194",
  },
  drowsy: {
    line: "M 114 194 Q 120 188 126 194",
  },
};

export function AibaBust({
  mood,
  behavior = "static",
  reducedMotion = false,
  variant = "default",
}: AibaBustProps) {
  const behaviorClass =
    reducedMotion || behavior === "static" ? "static" : behavior;
  const eyes = EYE_OPEN[mood];
  const mouth = MOUTH_PATHS[mood];
  const brows = BROW_PATHS[mood];
  const isStudio = variant === "studio";

  return (
    <svg
      viewBox={isStudio ? STUDIO_VIEWBOX : DEFAULT_VIEWBOX}
      width={isStudio ? 96 : 112}
      height={isStudio ? undefined : 142}
      role="img"
      aria-label={`Aiba, ${mood}`}
      className={`aiba-bust aiba-figure aiba-figure--${mood} aiba-behavior--${behaviorClass} ${isStudio ? "aiba-bust--studio" : ""} ${reducedMotion ? "is-reduced" : ""}`}
    >
      <title>Aiba</title>
      <g className="aiba-root">
        <g className="aiba-kanzashi" aria-hidden="true">
          <path d="M 120 8 L 120 53" />
          <path d="M 72 24 L 104 58" />
          <path d="M 168 24 L 136 58" />
        </g>

        <g className="aiba-ponytails" aria-hidden="true">
          <g className="aiba-ponytail aiba-ponytail--left">
            <ellipse cx="68" cy="66" rx="15" ry="17" className="aiba-ponytail-bun" />
            <path
              d="M 54 78 C 44 118 42 178 48 238 C 50 268 46 292 40 312"
              className="aiba-ponytail-tail"
            />
          </g>
          <g className="aiba-ponytail aiba-ponytail--right">
            <ellipse cx="172" cy="66" rx="15" ry="17" className="aiba-ponytail-bun" />
            <path
              d="M 186 78 C 196 118 198 178 192 238 C 190 268 194 292 200 312"
              className="aiba-ponytail-tail"
            />
          </g>
        </g>

        <path
          d="M 82 199 L 158 199 C 168 260 175 336 184 462 L 56 462 C 65 336 72 260 82 199 Z"
          className="aiba-kimono aiba-kimono--bust"
        />

        <g className="aiba-head">
          <circle cx="120" cy="132" r="76" className="aiba-face" />
          <path
            d="M 44 132 A 76 76 0 1 1 196 132 C 176 145 64 145 44 132 Z"
            className="aiba-hair-cap"
          />

          <g className="aiba-face-features">
            <g className="aiba-brows" aria-hidden="true">
              <path d={brows.left} className="aiba-brow aiba-brow--left" />
              <path d={brows.right} className="aiba-brow aiba-brow--right" />
            </g>

            <ellipse cx="88" cy="172" rx="10" ry="5" className="aiba-cheek aiba-cheek--left" />
            <ellipse cx="152" cy="172" rx="10" ry="5" className="aiba-cheek aiba-cheek--right" />

            <g className="aiba-eyes">
              <path d={eyes.left} className="aiba-eye aiba-eye--left" />
              <path d={eyes.right} className="aiba-eye aiba-eye--right" />
            </g>

            {mouth.lips && mood === "bright" ? (
              <path d={mouth.lips} className="aiba-lips" />
            ) : null}
            <path d={mouth.line} className="aiba-mouth" />
            <circle cx="158" cy="176" r="3.5" className="aiba-beauty-mark" />
          </g>
        </g>
      </g>
    </svg>
  );
}

