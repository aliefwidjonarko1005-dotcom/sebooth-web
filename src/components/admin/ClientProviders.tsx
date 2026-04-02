"use client";

import { ReactNode } from "react";
import { AdminEditProvider } from "./AdminEditProvider";
import { EditModeToggle } from "./EditModeToggle";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AdminEditProvider>
            {children}
            <EditModeToggle />
        </AdminEditProvider>
    );
}
