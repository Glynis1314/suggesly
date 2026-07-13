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
export default function FunnelChart({ data = [], selectedStage, onSelectStage, splitFinalStage = false }) {
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

  const splitFinal = splitFinalStage && N >= 2;
  const N_rows = splitFinal ? N - 1 : N;
  const totalHeight = N_rows * h + (N_rows - 1) * g;

  const minWidth = 160;
  const maxWidth = width;

  return (
    <svg viewBox={`0 0 ${width} ${totalHeight}`} className="w-full h-full max-h-full" style={{ overflow: 'visible' }}>
      {data.map((stage, i) => {
        const isSplitRow = splitFinal && i >= N - 2;
        const rowIndex = isSplitRow ? N_rows - 1 : i;

        const yStart = rowIndex * (h + g);
        const yEnd = yStart + h;

        // Linear interpolation for widths to get the classic taper look
        const wTop = maxWidth - (rowIndex / N_rows) * (maxWidth - minWidth);
        const wBottom = maxWidth - ((rowIndex + 1) / N_rows) * (maxWidth - minWidth);

        const xTopLeft = (maxWidth - wTop) / 2;
        const xTopRight = maxWidth - xTopLeft;
        const xBottomLeft = (maxWidth - wBottom) / 2;
        const xBottomRight = maxWidth - xBottomLeft;

        let points = '';
        let textX = width / 2;
        const splitGap = 8;

        if (isSplitRow) {
          if (i === N - 2) {
            // Left split segment (e.g. Closed Won / Converted)
            points = `${xTopLeft},${yStart} ${width / 2 - splitGap / 2},${yStart} ${width / 2 - splitGap / 2},${yEnd} ${xBottomLeft},${yEnd}`;
            textX = (xTopLeft + xBottomLeft + (width / 2 - splitGap / 2) * 2) / 4;
          } else {
            // Right split segment (e.g. Closed Lost / No-Show)
            points = `${width / 2 + splitGap / 2},${yStart} ${xTopRight},${yStart} ${xBottomRight},${yEnd} ${width / 2 + splitGap / 2},${yEnd}`;
            textX = (xTopRight + xBottomRight + (width / 2 + splitGap / 2) * 2) / 4;
          }
        } else {
          points = `${xTopLeft},${yStart} ${xTopRight},${yStart} ${xBottomRight},${yEnd} ${xBottomLeft},${yEnd}`;
        }

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

            {/* Optional subtle horizontal divider line inside Proposal/POC segments */}
            {!isSplitRow && (
              <line
                x1={xBottomLeft + 4}
                y1={yEnd - 1}
                x2={xBottomRight - 4}
                y2={yEnd - 1}
                stroke="rgba(0, 0, 0, 0.12)"
                strokeWidth={1}
                className="pointer-events-none"
              />
            )}

            {/* Labels and Subtext */}
            <text
              x={textX}
              y={yStart + h / 2 - 3}
              textAnchor="middle"
              className={`pointer-events-none select-none font-bold tracking-wide fill-white ${
                isSplitRow ? 'text-[11px]' : 'text-[13px]'
              }`}
            >
              {stage.label}
            </text>
            <text
              x={textX}
              y={yStart + h / 2 + 13}
              textAnchor="middle"
              className={`pointer-events-none select-none font-medium uppercase tracking-wider fill-white/90 ${
                isSplitRow ? 'text-[9px]' : 'text-[10px]'
              }`}
            >
              {isSplitRow
                ? `${formattedARR} ARR`
                : `${stage.count} ${stage.count === 1 ? 'Account' : 'Accounts'} | ${formattedARR} ARR`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
