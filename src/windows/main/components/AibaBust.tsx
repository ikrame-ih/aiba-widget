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

const EYE_OPEN: Record<
  AibaMood,
  { left: string; right: string; drowsy?: boolean }
> = {
  bright: {
    left: "M 76 158 Q 89 150 102 158",
    right: "M 138 158 Q 151 150 164 158",
  },
  focused: {
    left: "M 76 160 L 102 160",
    right: "M 138 160 L 164 160",
  },
  drowsy: {
    left: "M 76 162 Q 89 170 102 162",
    right: "M 138 162 Q 151 170 164 162",
    drowsy: true,
  },
};

const BROW_PATHS: Record<AibaMood, { left: string; right: string }> = {
  bright: {
    left: "M 72 140 Q 89 134 106 140",
    right: "M 134 140 Q 151 134 168 140",
  },
  focused: {
    left: "M 74 142 Q 89 140 104 138",
    right: "M 136 138 Q 151 140 166 142",
  },
  drowsy: {
    left: "M 74 144 Q 89 146 104 144",
    right: "M 136 144 Q 151 146 166 144",
  },
};

const MOUTH_PATHS: Record<AibaMood, { line: string; lips?: string }> = {
  bright: {
    line: "M 110 194 Q 120 202 130 194",
    lips: "M 111 195 Q 120 199 129 195 Q 120 205 111 195 Z",
  },
  focused: {
    line: "M 112 196 L 128 196",
  },
  drowsy: {
    line: "M 114 196 Q 120 190 126 196",
  },
};

export function AibaBust({
  mood,
  behavior = "idle",
  reducedMotion = false,
  variant = "default",
}: AibaBustProps) {
  const behaviorClass = reducedMotion
    ? "static"
    : behavior === "static"
      ? "idle"
      : behavior;
  const eyes = EYE_OPEN[mood];
  const mouth = MOUTH_PATHS[mood];
  const brows = BROW_PATHS[mood];
  const isStudio = variant === "studio";
  const showShine = mood === "bright";

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
              {showShine ? (
                <>
                  <circle cx="92" cy="156" r="2.2" className="aiba-eye-shine" />
                  <circle cx="154" cy="156" r="2.2" className="aiba-eye-shine" />
                </>
              ) : null}
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
