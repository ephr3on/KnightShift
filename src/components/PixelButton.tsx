import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'normal' | 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
}

export default function PixelButton({ children, variant = 'secondary', className = '', ...rest }: Props) {
  const resolvedVariant = variant === 'normal' ? 'secondary' : variant;
  return (
    <button className={`pixel-btn btn-${resolvedVariant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
