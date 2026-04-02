"use client";

import { useState, useEffect, useRef } from "react";
import { X, Eye, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminEdit } from "./AdminEditProvider";
import { SectionVisibilityControl } from "./SectionVisibilityControl";
import { GalleryMediaEditor } from "./GalleryMediaEditor";
import { TextEditModal } from "./TextEditModal";
import { IframeEditBridge } from "./IframeEditBridge";

interface SectionConfig {
    id: string;
    title: string;
    visible: boolean;
}

interface LayoutEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LayoutEditorModal({ isOpen, onClose }: LayoutEditorModalProps) {
    const { saveField } = useAdminEdit();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [sections, setSections] = useState<SectionConfig[]>([
        { id: "hero", title: "Hero Banner", visible: true },
        { id: "about", title: "About Section", visible: true },
        { id: "product", title: "Products & Services", visible: true },
        { id: "pricing", title: "Pricing Plans", visible: true },
        { id: "testimonials", title: "Testimonials", visible: true },
        { id: "gallery", title: "Visual Gallery", visible: true },
        { id: "instagram", title: "Instagram Feed", visible: true },
        { id: "faq", title: "FAQ Accordion", visible: true },
        { id: "news", title: "Latest News", visible: true },
        { id: "location", title: "Location Info", visible: true },
    ]);

    const [editingTab, setEditingTab] = useState<"sections" | "gallery" | "styling">(
        "sections"
    );
    const [previewScale, setPreviewScale] = useState(50);
    const [editingText, setEditingText] = useState<{
        text: string;
        section: string;
        fieldKey: string;
    } | null>(null);

    useEffect(() => {
        // Load saved section visibility from localStorage
        const saved = localStorage.getItem("sebooth-section-visibility");
        if (saved) {
            try {
                setSections(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load section visibility:", e);
            }
        }

        // Load saved preview scale
        const savedScale = localStorage.getItem("sebooth-preview-scale");
        if (savedScale) {
            try {
                setPreviewScale(parseInt(savedScale));
            } catch (e) {
                console.error("Failed to load preview scale:", e);
            }
        }
    }, []);

    // Save preview scale to localStorage
    useEffect(() => {
        localStorage.setItem("sebooth-preview-scale", previewScale.toString());
    }, [previewScale]);

    // Keyboard shortcuts for zoom
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "+") {
                    e.preventDefault();
                    setPreviewScale((prev) =>
                        Math.min(300, prev + 10)
                    );
                } else if (e.key === "-" || e.key === "_") {
                    e.preventDefault();
                    setPreviewScale((prev) =>
                        Math.max(10, prev - 10)
                    );
                } else if (e.key === "0") {
                    e.preventDefault();
                    setPreviewScale(100);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleVisibilityChange = (id: string, visible: boolean) => {
        const updated = sections.map((s) =>
            s.id === id ? { ...s, visible } : s
        );
        setSections(updated);
        localStorage.setItem("sebooth-section-visibility", JSON.stringify(updated));
        saveField("settings", `section_${id}_visible`, visible ? "true" : "false");
    };

    const handleTextClick = (text: string, section: string, fieldKey: string) => {
        setEditingText({ text, section, fieldKey });
    };

    const handleTextSave = async (newText: string) => {
        if (editingText) {
            await saveField(editingText.section, editingText.fieldKey, newText);
            setEditingText(null);
            // Refresh iframe to show updated content
            if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white border-4 border-black w-screen h-screen max-w-7xl max-h-[90vh] flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b-4 border-black bg-primary text-white">
                        <h2 className="text-2xl font-black uppercase">
                            🎨 Layout Editor
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 transition-colors rounded"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Panel - Editor Controls */}
                        <div className="w-96 border-r-4 border-black bg-white flex flex-col">
                            {/* Tabs */}
                            <div className="flex border-b-4 border-black">
                                {[
                                    { key: "sections", label: "Sections", icon: "📑" },
                                    { key: "gallery", label: "Gallery", icon: "🖼️" },
                                    { key: "styling", label: "Styling", icon: "🎭" },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() =>
                                            setEditingTab(
                                                tab.key as
                                                    | "sections"
                                                    | "gallery"
                                                    | "styling"
                                            )
                                        }
                                        className={`flex-1 py-3 px-4 font-bold uppercase text-sm border-r-4 border-black transition-all last:border-r-0 ${
                                            editingTab === tab.key
                                                ? "bg-secondary text-white"
                                                : "bg-white text-text-dark hover:bg-primary/10"
                                        }`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {editingTab === "sections" && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-black uppercase text-sm mb-3 text-text-dark">
                                                Section Visibility
                                            </h3>
                                            <SectionVisibilityControl
                                                sections={sections}
                                                onVisibilityChange={
                                                    handleVisibilityChange
                                                }
                                            />
                                        </div>
                                        <div className="bg-blue-100 border-2 border-blue-400 p-3 text-sm font-bold text-blue-900">
                                            ℹ️ Click eye icon to show/hide
                                            sections on the homepage.
                                        </div>
                                    </div>
                                )}

                                {editingTab === "gallery" && (
                                    <GalleryMediaEditor />
                                )}

                                {editingTab === "styling" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block font-bold uppercase text-sm mb-3 text-text-dark">
                                                🔍 Preview Zoom
                                            </label>

                                            {/* Zoom Buttons */}
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                {[25, 50, 75, 100, 150, 200].map(
                                                    (scale) => (
                                                        <button
                                                            key={scale}
                                                            onClick={() =>
                                                                setPreviewScale(
                                                                    scale
                                                                )
                                                            }
                                                            className={`py-2 px-3 font-bold uppercase text-xs border-2 border-black transition-all ${
                                                                previewScale ===
                                                                scale
                                                                    ? "bg-secondary text-white hard-shadow-black"
                                                                    : "bg-white text-text-dark hover:bg-primary/10"
                                                            }`}
                                                        >
                                                            {scale}%
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            {/* Manual Input */}
                                            <div className="flex gap-2 mb-4">
                                                <button
                                                    onClick={() =>
                                                        setPreviewScale(
                                                            Math.max(
                                                                10,
                                                                previewScale - 10
                                                            )
                                                        )
                                                    }
                                                    className="px-3 py-2 bg-primary text-white font-bold border-2 border-black hover:bg-primary/80 transition-all"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="300"
                                                    value={previewScale}
                                                    onChange={(e) => {
                                                        const val = Math.min(
                                                            300,
                                                            Math.max(
                                                                10,
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 100
                                                            )
                                                        );
                                                        setPreviewScale(val);
                                                    }}
                                                    className="flex-1 p-2 border-2 border-black font-bold uppercase text-center text-sm"
                                                    placeholder="Scale %"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setPreviewScale(
                                                            Math.min(
                                                                300,
                                                                previewScale + 10
                                                            )
                                                        )
                                                    }
                                                    className="px-3 py-2 bg-secondary text-white font-bold border-2 border-black hover:bg-secondary/80 transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Slider */}
                                            <div className="space-y-2">
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="300"
                                                    value={previewScale}
                                                    onChange={(e) =>
                                                        setPreviewScale(
                                                            parseInt(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    className="w-full cursor-pointer"
                                                />
                                                <div className="text-xs text-primary/60 font-bold text-center">
                                                    Current: {previewScale}%
                                                    (10% - 300%)
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-100 border-2 border-yellow-400 p-3 text-sm font-bold text-yellow-900 space-y-2">
                                            <p>
                                                ⚙️ Styling features coming
                                                soon:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-xs">
                                                <li>Global color scheme</li>
                                                <li>
                                                    Section padding & margins
                                                </li>
                                                <li>Shadow intensity</li>
                                                <li>Font sizes</li>
                                                <li>Border styles</li>
                                            </ul>
                                        </div>

                                        <div className="bg-blue-100 border-2 border-blue-400 p-3 text-xs font-bold text-blue-900 space-y-1">
                                            <p className="mb-2">⌨️ Keyboard Shortcuts:</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                <li>
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        Ctrl
                                                    </kbd>{" "}
                                                    +{" "}
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        +
                                                    </kbd>{" "}
                                                    = Zoom In
                                                </li>
                                                <li>
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        Ctrl
                                                    </kbd>{" "}
                                                    +{" "}
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        −
                                                    </kbd>{" "}
                                                    = Zoom Out
                                                </li>
                                                <li>
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        Ctrl
                                                    </kbd>{" "}
                                                    +{" "}
                                                    <kbd className="px-1 py-0.5 bg-white border border-blue-400">
                                                        0
                                                    </kbd>{" "}
                                                    = Reset to 100%
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t-4 border-black p-4 bg-primary/5">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-green-500 text-white font-black uppercase py-3 px-4 border-2 border-black hover:bg-green-600 transition-all"
                                >
                                    ✓ Done Editing Layout
                                </button>
                            </div>
                        </div>

                        {/* Right Panel - Live Preview */}
                        <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Eye className="w-5 h-5 text-primary" />
                                <h3 className="font-black uppercase text-text-dark">
                                    Live Preview
                                </h3>
                                <span className="text-xs font-bold text-primary/60 ml-auto">
                                    Scale: {previewScale}%
                                </span>
                            </div>

                            {/* Preview Container */}
                            <div className="flex-1 overflow-auto bg-white border-4 border-black flex items-start justify-center relative">
                                <iframe
                                    ref={iframeRef}
                                    title="Live Preview"
                                    src="/"
                                    className="border-none"
                                    style={{
                                        width: `${100 / (previewScale / 100)}%`,
                                        height: `${100 / (previewScale / 100)}%`,
                                        transform: `scale(${previewScale / 100})`,
                                        transformOrigin: "top center",
                                    }}
                                />
                                <IframeEditBridge
                                    iframeRef={iframeRef}
                                    onTextClick={handleTextClick}
                                />
                            </div>

                            {/* Info */}
                            <div className="mt-4 text-xs text-primary/60 font-bold p-3 bg-blue-50 border-2 border-blue-200 space-y-1">
                                <p>
                                    💡 Preview updates as you make changes. Edit text
                                    by clicking on the page directly.
                                </p>
                                <p>
                                    🔍 Use the zoom controls on the left or keyboard
                                    shortcuts (Ctrl++ / Ctrl+- / Ctrl+0) to adjust scale.
                                </p>
                                <p>
                                    ✎ Click any text in the preview to edit it instantly!
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Text Edit Modal */}
            <TextEditModal
                isOpen={editingText !== null}
                currentText={editingText?.text || ""}
                label={`Editing: ${editingText?.fieldKey || ""}`}
                onSave={handleTextSave}
                onClose={() => setEditingText(null)}
            />
        </AnimatePresence>
    );
}
