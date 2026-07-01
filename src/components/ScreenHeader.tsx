import type { ReactNode } from 'react';
import PixelButton from './PixelButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  className?: string;
}

export default function ScreenHeader({
  title,
  onBack,
  backLabel = 'Back',
  right,
  className = '',
}: ScreenHeaderProps) {
  return (
    <header className={`screen-header ${className}`.trim()}>
      <div className="screen-header-action screen-header-action-left">
        {onBack ? (
          <PixelButton variant="ghost" className="screen-header-btn" onClick={onBack}>
            ← {backLabel}
          </PixelButton>
        ) : null}
      </div>
      <div className="screen-header-copy">
        <div className="screen-header-kicker">KnightShift</div>
        <h1>{title}</h1>
      </div>
      <div className="screen-header-action screen-header-action-right">
        {right}
      </div>
    </header>
  );
}
