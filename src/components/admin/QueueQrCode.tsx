"use client";

import { useEffect, useRef } from "react";

interface QueueQrCodeProps {
    url: string;
    size?: number;
}

/**
 * Simple QR code display using the free qrserver.com API.
 * No npm dependency needed.
 */
export default function QueueQrCode({ url, size = 180 }: QueueQrCodeProps) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=svg&margin=2`;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={qrUrl}
                alt="QR Code untuk antrean"
                width={size}
                height={size}
                className="rounded-xl border border-[#1A1A1A]/10"
            />
            <p className="text-xs text-[#1A1A1A]/40 font-medium break-all text-center max-w-xs">
                {url}
            </p>
        </div>
    );
}
