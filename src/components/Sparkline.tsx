"use client";

type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
};

/**
 * A bare line chart for the hero card: no axes, no grid, just the shape of the
 * last month, with a dot on today's value.
 */
export function Sparkline({
  values,
  width = 760,
  height = 90,
  stroke = "#cdd9d3",
  className,
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <div className={className} style={{ height }} aria-hidden>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={stroke}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.5"
          />
        </svg>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  // A dead-flat series would divide by zero; give it a nominal band instead.
  const span = max - min || Math.abs(max) * 0.01 || 1;
  const padding = 10;
  // Inset horizontally too, so the marker on today's value is not half-clipped
  // by the right edge of the viewBox.
  const padX = 6;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padX * 2;

  const points = values.map((value, index) => {
    const x = padX + (index / (values.length - 1)) * usableWidth;
    const y = padding + (1 - (value - min) / span) * usableHeight;
    return [x, y] as const;
  });

  const path = smoothPath(points);
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-full w-full ${className ?? ""}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Portfolio value trend over the last ${values.length} sessions`}
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="4" fill={stroke} />
    </svg>
  );
}

/** Catmull-Rom-ish smoothing: midpoint curves keep the line soft without overshoot. */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const midX = (px + x) / 2;
    d += ` Q ${px} ${py} ${midX} ${(py + y) / 2}`;
    d += ` Q ${x} ${y} ${x} ${y}`;
  }
  return d;
}
