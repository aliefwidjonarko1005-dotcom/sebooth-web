"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { revalidateSiteContent } from "@/app/actions";

interface AdminEditContextType {
    isAdmin: boolean;
    editMode: boolean;
    toggleEditMode: () => void;
    saveField: (section: string, key: string, value: string) => Promise<void>;
    toast: string;
    layoutEditorOpen: boolean;
    setLayoutEditorOpen: (open: boolean) => void;
}

const AdminEditContext = createContext<AdminEditContextType>({
    isAdmin: false,
    editMode: false,
    toggleEditMode: () => {},
    saveField: async () => {},
    toast: "",
    layoutEditorOpen: false,
    setLayoutEditorOpen: () => {},
});

export function useAdminEdit() {
    return useContext(AdminEditContext);
}

export function AdminEditProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [toast, setToast] = useState("");
    const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);

    useEffect(() => {
        async function checkAdmin() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const email = user.email || "";
            const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
                .split(",")
                .map((e) => e.trim().toLowerCase());
            const isEnvAdmin = envAdmins.includes(email.toLowerCase());

            if (isEnvAdmin) {
                setIsAdmin(true);
                return;
            }

            const { data: adminData } = await supabase
                .from("admins")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (adminData) setIsAdmin(true);
        }
        checkAdmin();
    }, []);

    const toggleEditMode = useCallback(() => {
        setEditMode((prev) => !prev);
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 2000);
    }, []);

    const saveField = useCallback(
        async (section: string, key: string, value: string) => {
            const supabase = createClient();
            const { data: existing } = await supabase
                .from("site_content")
                .select("id")
                .eq("section", section)
                .eq("key", key)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from("site_content")
                    .update({ value, updated_at: new Date().toISOString() })
                    .eq("id", existing.id);
            } else {
                await supabase
                    .from("site_content")
                    .insert({ section, key, value });
            }
            await revalidateSiteContent();
            showToast("✓ Saved!");
        },
        [showToast]
    );

    return (
        <AdminEditContext.Provider value={{ isAdmin, editMode, toggleEditMode, saveField, toast, layoutEditorOpen, setLayoutEditorOpen }}>
            {children}
            {/* Global toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#0F3D2E] text-white px-6 py-2.5 text-sm font-bold shadow-2xl pointer-events-none"
                    style={{ animation: "fadeInDown 0.2s ease-out" }}>
                    {toast}
                </div>
            )}
        </AdminEditContext.Provider>
    );
}
