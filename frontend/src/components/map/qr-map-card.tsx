"use client";

import { cardClass } from "@/csmju";
import { DescriptionIcon as QrCode } from "@/csmju";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export function QrMapCard() {
  const [url, setUrl] = useState("/map");
  useEffect(() => setUrl(`${window.location.origin}/map`), []);

  return (
    <details className={`${cardClass} group p-4`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-primary-container">
        <QrCode width={20} height={20} aria-hidden="true" /> QR Code
        สำหรับหน้าแผนที่
      </summary>
      <div className="mt-4 flex items-center gap-4">
        <QRCodeSVG value={url} size={92} level="M" marginSize={1} />
        <div className="min-w-0 text-label-md text-on-surface-variant">
          <p>สแกนเพื่อเปิดหน้าแผนที่โดยตรง</p>
          <p className="mt-1 truncate text-caption text-on-surface-variant">
            {url}
          </p>
        </div>
      </div>
    </details>
  );
}
