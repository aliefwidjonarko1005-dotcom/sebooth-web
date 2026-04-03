"use client";

import { useAdminEdit } from "./AdminEditProvider";
import { LayoutEditorModal } from "./LayoutEditorModal";
import { PenTool, Check, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function EditModeToggle() {
    const { isAdmin, editMode, toggleEditMode, layoutEditorOpen, setLayoutEditorOpen } = useAdminEdit();

    if (!isAdmin) return null;

    return (
        <>
            <LayoutEditorModal
                isOpen={layoutEditorOpen}
                onClose={() => setLayoutEditorOpen(false)}
            />

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-3"
                >
                    {/* Admin Panel Link */}
                    {editMode && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1A1A1A] text-xs font-bold border-2 border-black hard-shadow-black hover:-translate-y-0.5 transition-transform"
                            >
                                ⚙️ Admin Panel
                            </Link>
                        </motion.div>
                    )}

                    {/* Layout Editor Button (Hidden on Mobile) */}
                    {editMode && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => setLayoutEditorOpen(true)}
                            className="hidden md:flex items-center gap-2.5 px-5 py-3 bg-blue-600 text-white font-black uppercase text-sm border-2 border-black hard-shadow-blue hover:-translate-y-0.5 transition-transform"
                        >
                            <Layout className="w-4 h-4" />
                            Layout
                        </motion.button>
                    )}

                    {/* Edit Mode Toggle */}
                    <button
                        onClick={toggleEditMode}
                        className={`flex items-center gap-2.5 px-5 py-3 font-black uppercase text-sm border-2 border-black transition-all duration-200 ${
                            editMode
                                ? "bg-secondary text-white hard-shadow-black"
                                : "bg-primary text-white hard-shadow-orange hover:-translate-y-0.5"
                        }`}
                    >
                        {editMode ? (
                            <>
                                <Check className="w-4 h-4" />
                                Done Editing
                            </>
                        ) : (
                            <>
                                <PenTool className="w-4 h-4" />
                                Edit Page
                            </>
                        )}
                    </button>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
