"use client";

import s from "./qrCard.module.css";

export function PrintButton() {
    return (
        <button type="button" className={s.printBtn} onClick={() => window.print()}>
            Cetak kartu QR
        </button>
    );
}
