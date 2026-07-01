import { useMemo } from 'react';
import { createQrMatrix, qrMatrixToPath } from '../utils/qrCode';

interface Props {
  value: string;
  label?: string;
}

export default function QRCode({ value, label = 'Invite QR code' }: Props) {
  const qr = useMemo(() => {
    try {
      const matrix = createQrMatrix(value);
      return { matrix, path: qrMatrixToPath(matrix) };
    } catch {
      return null;
    }
  }, [value]);

  if (!qr) {
    return <div className="invite-qr-fallback">QR unavailable<br />Use the invite link</div>;
  }

  const size = qr.matrix.length;
  const quiet = 4;
  const viewBox = `${-quiet} ${-quiet} ${size + quiet * 2} ${size + quiet * 2}`;

  return (
    <svg
      className="invite-qr"
      viewBox={viewBox}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect x={-quiet} y={-quiet} width={size + quiet * 2} height={size + quiet * 2} rx="3" fill="currentColor" opacity="0.96" />
      <path d={qr.path} fill="var(--qr-ink, #111827)" />
    </svg>
  );
}
