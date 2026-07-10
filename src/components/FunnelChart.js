import React from 'react';
import { formatCurrencyCompact } from '../utils/format';

/**
 * Reusable FunnelChart component rendering horizontal stacked trapezoid segments.
 *
 * @param {object} props
 * @param {Array<{label: string, count: number, value: number, color: string}>} props.data
 * @param {string} props.selectedStage
 * @param {function} props.onSelectStage
 */
export default function FunnelChart({ data = [], selectedStage, onSelectStage }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        No funnel data available
      </div>
    );
  }

  const width = 500;
  const h = 80; // Fixed coordinate height for segment (~80px visually)
  const g = 8;  // Fixed coordinate gap
  const N = data.length;
  const totalHeight = N * h + (N - 1) * g;

  const minWidth = 160;
  const maxWidth = width;

  return (
    <svg viewBox={`0 0 ${width} ${totalHeight}`} className="w-full h-full max-h-full" style={{ overflow: 'visible' }}>
      {data.map((stage, i) => {
        const yStart = i * (h + g);
        const yEnd = yStart + h;

        // Linear interpolation for widths to get the classic taper look
        const wTop = maxWidth - (i / N) * (maxWidth - minWidth);
        const wBottom = maxWidth - ((i + 1) / N) * (maxWidth - minWidth);

        const xTopLeft = (maxWidth - wTop) / 2;
        const xTopRight = maxWidth - xTopLeft;
        const xBottomLeft = (maxWidth - wBottom) / 2;
        const xBottomRight = maxWidth - xBottomLeft;

        const points = `${xTopLeft},${yStart} ${xTopRight},${yStart} ${xBottomRight},${yEnd} ${xBottomLeft},${yEnd}`;
        const isSelected = selectedStage === stage.label;

        const formattedARR = formatCurrencyCompact(stage.value, 1);

        return (
          <g
            key={stage.label}
            onClick={() => onSelectStage && onSelectStage(stage.label)}
            className="cursor-pointer group"
          >
            {/* SVG Polygon segment */}
            <polygon
              points={points}
              fill={stage.color}
              stroke={isSelected ? '#0f172a' : '#ffffff'}
              strokeWidth={isSelected ? 3 : 1.5}
              strokeLinejoin="round"
              className="transition-all duration-300 hover:brightness-[1.08] hover:opacity-95"
            />

            {/* Labels and Subtext */}
            <text
              x={width / 2}
              y={yStart + h / 2 - 3}
              textAnchor="middle"
              className="pointer-events-none select-none text-[13px] font-bold tracking-wide fill-white"
            >
              {stage.label}
            </text>
            <text
              x={width / 2}
              y={yStart + h / 2 + 13}
              textAnchor="middle"
              className="pointer-events-none select-none text-[10px] font-medium uppercase tracking-wider fill-white/90"
            >
              {stage.count} {stage.count === 1 ? 'Account' : 'Accounts'} | {formattedARR} ARR
            </text>
          </g>
        );
      })}
    </svg>
  );
}
