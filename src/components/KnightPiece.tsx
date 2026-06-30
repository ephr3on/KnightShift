import type { Color } from '../types';

interface Props {
  color: Color;
  size?: 'normal' | 'medium' | 'small' | 'tiny';
}

export default function KnightPiece({ color, size = 'normal' }: Props) {
  const isWhite = color === 'white';
  const body = isWhite ? '#e8e8e8' : '#1c1c2e';
  const outline = isWhite ? '#2d3748' : '#8b9bb4';
  const eye = isWhite ? '#1c1c2e' : '#e8e8e8';
  const shade = isWhite ? '#c0c0c0' : '#0a0a14';
  const highlight = isWhite ? '#ffffff' : '#3a3a5e';

  const sizeClass = size === 'medium' ? 'medium' : size === 'small' ? 'small' : size === 'tiny' ? 'tiny' : '';

  return (
    <div className={`knight-piece ${sizeClass}`}>
      <svg
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated', display: 'block' }}
      >
        {/* Base plate */}
        <rect x="6" y="34" width="28" height="4" rx="0" fill={outline} />
        <rect x="8" y="32" width="24" height="4" fill={body} stroke={outline} strokeWidth="1.5" />

        {/* Torso */}
        <rect x="12" y="22" width="16" height="11" fill={body} stroke={outline} strokeWidth="1.5" />
        {/* Torso shading */}
        <rect x="22" y="23" width="4" height="9" fill={shade} opacity="0.3" />

        {/* Neck */}
        <rect x="15" y="15" width="10" height="8" fill={body} stroke={outline} strokeWidth="1.5" />

        {/* Head */}
        <rect x="13" y="7" width="14" height="10" fill={body} stroke={outline} strokeWidth="1.5" />

        {/* Snout */}
        <rect x="7" y="11" width="9" height="6" fill={body} stroke={outline} strokeWidth="1.5" />
        <rect x="5" y="13" width="4" height="3" fill={body} stroke={outline} strokeWidth="1.5" />

        {/* Nostril */}
        <rect x="6" y="14" width="2" height="1" fill={outline} />

        {/* Ear (tall pixel ear) */}
        <rect x="22" y="3" width="4" height="6" fill={body} stroke={outline} strokeWidth="1.5" />
        <rect x="23" y="1" width="2" height="4" fill={body} stroke={outline} strokeWidth="1.5" />

        {/* Eye */}
        <rect x="16" y="9" width="3" height="3" fill={eye} />
        <rect x="16" y="9" width="1" height="1" fill={highlight} opacity="0.7" />

        {/* Mane / back detail */}
        <rect x="24" y="8" width="2" height="12" fill={outline} opacity="0.35" />
        <rect x="26" y="10" width="2" height="10" fill={outline} opacity="0.2" />

        {/* Highlight on head */}
        <rect x="14" y="8" width="4" height="2" fill={highlight} opacity="0.4" />

        {/* Front leg suggestion */}
        <rect x="14" y="30" width="4" height="3" fill={shade} opacity="0.4" />
      </svg>
    </div>
  );
}
