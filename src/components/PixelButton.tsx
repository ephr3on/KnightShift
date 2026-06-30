import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'normal' | 'danger';
}

export default function PixelButton({ children, variant = 'normal', className = '', ...rest }: Props) {
  return (
    <button className={`pixel-btn ${variant === 'danger' ? 'danger' : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}
