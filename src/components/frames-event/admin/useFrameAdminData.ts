"use client";

import { useCallback, useEffect, useState } from "react";
import type { ArchiveItem, FrameEvent } from "@/data/frameEvents";
import type { FrameItem } from "@/data/frames";

export type ArchiveRow = ArchiveItem & { src: string };

export interface FrameAdminData {
    events: FrameEvent[];
    catalogue: FrameItem[];
    archive: ArchiveRow[];
}

type LoadState =
    | { status: "loading" }
    | { status: "signed-out" }
    | { status: "forbidden" }
    | { status: "error"; message: string }
    | { status: "ready"; data: FrameAdminData };

/** Loads /api/admin/frame-events for super admins; `reload` refetches after a write. */
export function useFrameAdminData() {
    const [state, setState] = useState<LoadState>({ status: "loading" });

    const reload = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/frame-events", { cache: "no-store" });
            if (res.status === 401) return setState({ status: "signed-out" });
            if (res.status === 403) return setState({ status: "forbidden" });
            const body = await res.json();
            if (!res.ok) return setState({ status: "error", message: body.error || "Gagal memuat data." });
            setState({ status: "ready", data: body as FrameAdminData });
        } catch {
            setState({ status: "error", message: "Tidak bisa terhubung ke server." });
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- first load of remote data
        reload();
    }, [reload]);

    return { state, reload };
}

/** POSTs JSON to an admin route and returns its body, throwing the route's own error message. */
export async function postAdmin<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Permintaan gagal.");
    return data as T;
}
