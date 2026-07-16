'use client';

import { arrowHeadPoints, type HelpArrowGeometry } from '@/lib/help/arrow-path';

export function HelpArrow({
  geometry,
  label,
}: {
  geometry: HelpArrowGeometry;
  label?: string;
}) {
  const head = arrowHeadPoints(geometry.tip, geometry.tipAngle, 15);
  return (
    <svg className="help-arrow" width="100%" height="100%" aria-hidden="true">
      <path
        className="help-arrow-stroke help-arrow-stroke--outline"
        d={geometry.path}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="help-arrow-stroke help-arrow-stroke--fill"
        d={geometry.path}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        className="help-arrow-head help-arrow-head--outline"
        points={head}
      />
      <polygon
        className="help-arrow-head help-arrow-head--fill"
        points={head}
      />
      {label ? (
        <text
          className="help-arrow-label"
          x={geometry.labelAt.x}
          y={geometry.labelAt.y}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}
