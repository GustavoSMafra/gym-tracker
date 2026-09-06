import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

// Shared stroke treatment for the line-icon set (everything except the two
// filled celebration glyphs and play). Kept as a plain object rather than a
// wrapper component so each icon can still compose Path/Circle freely.
const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

export function HomeIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 11l9-8 9 8" {...stroke(color)} />
      <Path d="M5 10v10h14V10" {...stroke(color)} />
    </Svg>
  );
}

// Redrawn as a plain barbell (bar + a weight plate at each end) — the
// original mockup path (two overlapping rotated capsules) read as an
// abstract bowtie shape at real icon size, not a recognizable dumbbell.
export function DumbbellIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 12h12" {...stroke(color)} />
      <Rect x={2} y={7} width={4} height={10} rx={1.5} {...stroke(color)} />
      <Rect x={18} y={7} width={4} height={10} rx={1.5} {...stroke(color)} />
    </Svg>
  );
}

export function ClockIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...stroke(color)} />
      <Path d="M12 7v5l3.5 2" {...stroke(color)} />
    </Svg>
  );
}

export function CheckIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" {...stroke(color)} />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" {...stroke(color)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 6l6 6-6 6" {...stroke(color)} />
    </Svg>
  );
}

export function CloseIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" {...stroke(color)} />
    </Svg>
  );
}

export function CalendarIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
        {...stroke(color)}
      />
    </Svg>
  );
}

export function EditIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" {...stroke(color)} />
    </Svg>
  );
}

export function TrashIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" {...stroke(color)} />
    </Svg>
  );
}

// Celebration glyphs — filled, not stroked, per the design system's rule
// that these two stay visually distinct from the rest of the icon set.
export function FlameIcon({ size = 24, color = '#F0A93A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c1 3-2.5 4.2-2.5 7.2 0 1.6 1.1 2.8 2.5 2.8s2.5-1.2 2.5-2.8c0-1-.4-1.7-.9-2.4 1.8 1 3.4 3 3.4 5.6 0 3.3-2.5 6-5 6s-5-2.7-5-6c0-4.8 3.3-6.6 5-10.4z"
        fill={color}
      />
    </Svg>
  );
}

export function TrophyIcon({ size = 24, color = '#F0A93A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2 15 9l7 1-5.2 5 1.3 7-6.1-3.4L6 22l1.3-7L2 10l7-1z" fill={color} />
    </Svg>
  );
}

export function PlayIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5v14l11-7z" fill={color} />
    </Svg>
  );
}
