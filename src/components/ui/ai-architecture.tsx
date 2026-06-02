import { cn } from "@/lib/utils";

export interface AiArchitectureSvgProps {
  className?: string;
  width?: string;
  height?: string;
  text?: string;
  showAiConnections?: boolean;
  lineMarkerSize?: number;
  animateText?: boolean;
  animateLines?: boolean;
  animateMarkers?: boolean;
}

/**
 * Influenza Cortex SVG: the central hub with signal lines flowing in.
 * Recolored to acid lime / cream / ink palette.
 */
const KortexCortex = ({
  className,
  width = "100%",
  height = "100%",
  text = "I",
  showAiConnections = true,
  animateText = true,
  lineMarkerSize = 18,
  animateLines = true,
  animateMarkers = true,
}: AiArchitectureSvgProps) => {
  return (
    <svg
      className={cn("text-cream/55", className)}
      width={width}
      height={height}
      viewBox="0 0 200 100"
      role="img"
      aria-label="Influenza cortex: eight creator marketing signal sources flowing into a central command hub"
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="0.3"
        strokeDasharray="100 100"
        pathLength="100"
        markerStart="url(#kortex-circle-marker)"
      >
        <path strokeDasharray="100 100" pathLength="100" d="M 10 20 h 79.5 q 5 0 5 5 v 30" />
        <path strokeDasharray="100 100" pathLength="100" d="M 180 10 h -69.7 q -5 0 -5 5 v 30" />
        <path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" />
        <path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" />
        <path strokeDasharray="100 100" pathLength="100" d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" />
        <path d="M 94.8 95 v -36" />
        <path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" />
        <path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" />
        {animateLines && (
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        )}
      </g>

      {/* Signal pulses traveling along the 8 paths: all biased to Kortex palette */}
      <g mask="url(#kortex-mask-1)">
        <circle className="ai-architecture ai-line-1" cx="0" cy="0" r="8" fill="url(#kortex-acid-grad)" />
      </g>
      <g mask="url(#kortex-mask-2)">
        <circle className="ai-architecture ai-line-2" cx="0" cy="0" r="8" fill="url(#kortex-cream-grad)" />
      </g>
      <g mask="url(#kortex-mask-3)">
        <circle className="ai-architecture ai-line-3" cx="0" cy="0" r="8" fill="url(#kortex-acid-grad)" />
      </g>
      <g mask="url(#kortex-mask-4)">
        <circle className="ai-architecture ai-line-4" cx="0" cy="0" r="8" fill="url(#kortex-amber-grad)" />
      </g>
      <g mask="url(#kortex-mask-5)">
        <circle className="ai-architecture ai-line-5" cx="0" cy="0" r="8" fill="url(#kortex-acid-grad)" />
      </g>
      <g mask="url(#kortex-mask-6)">
        <circle className="ai-architecture ai-line-6" cx="0" cy="0" r="8" fill="url(#kortex-cream-grad)" />
      </g>
      <g mask="url(#kortex-mask-7)">
        <circle className="ai-architecture ai-line-7" cx="0" cy="0" r="8" fill="url(#kortex-acid-grad)" />
      </g>
      <g mask="url(#kortex-mask-8)">
        <circle className="ai-architecture ai-line-8" cx="0" cy="0" r="8" fill="url(#kortex-amber-grad)" />
      </g>

      {/* K Box (cortex core) */}
      <g>
        {showAiConnections && (
          <g fill="url(#kortex-connection-gradient)">
            <rect x="93" y="37" width="2.5" height="5" rx="0.7" />
            <rect x="104" y="37" width="2.5" height="5" rx="0.7" />
            <rect x="116.3" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)" />
            <rect x="122.8" y="44" width="2.5" height="5" rx="0.7" transform="rotate(90 116.25 45.5)" />
            <rect x="104" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)" />
            <rect x="114.5" y="16" width="2.5" height="5" rx="0.7" transform="rotate(180 105.25 39.5)" />
            <rect x="80" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)" />
            <rect x="87" y="-13.6" width="2.5" height="5" rx="0.7" transform="rotate(270 115.25 19.5)" />
          </g>
        )}
        <rect
          x="85"
          y="40"
          width="30"
          height="20"
          rx="0"
          fill="#FB5424"
          stroke="#2E1023"
          strokeWidth="0.6"
          strokeOpacity="1"
          filter="url(#kortex-light-shadow)"
        />
        <text
          x="100"
          y="53.5"
          fontSize="11"
          fill={animateText ? "url(#kortex-text-gradient)" : "#2E1023"}
          fontFamily="Fraunces, Georgia, serif"
          fontStyle="italic"
          fontWeight="700"
          letterSpacing="0.02em"
          textAnchor="middle"
        >
          {text}
        </text>
      </g>

      <defs>
        <mask id="kortex-mask-1"><path d="M 10 20 h 79.5 q 5 0 5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-2"><path d="M 180 10 h -69.7 q -5 0 -5 5 v 24" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-3"><path d="M 130 20 v 21.8 q 0 5 -5 5 h -10" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-4"><path d="M 170 80 v -21.8 q 0 -5 -5 -5 h -50" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-5"><path d="M 135 65 h 15 q 5 0 5 5 v 10 q 0 5 -5 5 h -39.8 q -5 0 -5 -5 v -20" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-6"><path d="M 94.8 95 v -36" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-7"><path d="M 88 88 v -15 q 0 -5 -5 -5 h -10 q -5 0 -5 -5 v -5 q 0 -5 5 -5 h 14" strokeWidth="0.5" stroke="white" /></mask>
        <mask id="kortex-mask-8"><path d="M 30 30 h 25 q 5 0 5 5 v 6.5 q 0 5 5 5 h 20" strokeWidth="0.5" stroke="white" /></mask>

        <radialGradient id="kortex-acid-grad" fx="1">
          <stop offset="0%" stopColor="#FFB68A" />
          <stop offset="50%" stopColor="#FB5424" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="kortex-cream-grad" fx="1">
          <stop offset="0%" stopColor="#2E1023" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="kortex-amber-grad" fx="1">
          <stop offset="0%" stopColor="#F35075" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <filter id="kortex-light-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#FB5424" floodOpacity="0.4" />
        </filter>

        <marker
          id="kortex-circle-marker"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={lineMarkerSize}
          markerHeight={lineMarkerSize}
        >
          <circle cx="5" cy="5" r="2" fill="#F5EFE3" stroke="#2E1023" strokeOpacity="0.9" strokeWidth="0.6">
            {animateMarkers && <animate attributeName="r" values="0; 3; 2" dur="0.5s" />}
          </circle>
        </marker>

        <linearGradient id="kortex-connection-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E1023" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#FB5424" />
        </linearGradient>

        <linearGradient id="kortex-text-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2E1023">
            <animate
              attributeName="offset"
              values="-2; -1; 0"
              dur="5s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.5; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </stop>
          <stop offset="25%" stopColor="#FB5424">
            <animate
              attributeName="offset"
              values="-1; 0; 1"
              dur="5s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.5; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </stop>
          <stop offset="50%" stopColor="#2E1023">
            <animate
              attributeName="offset"
              values="0; 1; 2;"
              dur="5s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.5; 1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </stop>
        </linearGradient>
      </defs>
    </svg>
  );
};

export { KortexCortex };
