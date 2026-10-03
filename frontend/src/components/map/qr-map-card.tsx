'use client';

import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export function QrMapCard() {
  const [url, setUrl] = useState('/map');
  useEffect(() => setUrl(`${window.location.origin}/map`), []);

  return (
    <details className="card group p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-brand-700">
        <QrCode size={19} /> QR Code สำหรับหน้าแผนที่
      </summary>
      <div className="mt-4 flex items-center gap-4">
        <QRCodeSVG value={url} size={92} level="M" marginSize={1} />
        <div className="min-w-0 text-sm text-slate-600">
          <p>สแกนเพื่อเปิดหน้าแผนที่โดยตรง</p>
          <p className="mt-1 truncate text-xs text-slate-400">{url}</p>
        </div>
      </div>
    </details>
  );
}
