"use client";

import { Eye, EyeOff, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

interface SectionConfig {
    id: string;
    title: string;
    visible: boolean;
}

interface SectionVisibilityControlProps {
    sections: SectionConfig[];
    onVisibilityChange: (id: string, visible: boolean) => void;
    onReorder?: (sections: SectionConfig[]) => void;
    draggable?: boolean;
}

export function SectionVisibilityControl({
    sections,
    onVisibilityChange,
    draggable = true,
}: SectionVisibilityControlProps) {
    return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {sections.map((section, idx) => (
                <motion.div
                    key={section.id}
                    layout
                    className="flex items-center gap-3 p-3 bg-white border-2 border-black hover:bg-primary/5 transition-colors group"
                    draggable={draggable}
                >
                    {draggable && (
                        <GripVertical className="w-4 h-4 text-primary/40 group-hover:text-primary cursor-grab active:cursor-grabbing" />
                    )}

                    {/* Section Title */}
                    <div className="flex-1 font-bold uppercase text-sm text-text-dark">
                        {idx + 1}. {section.title}
                    </div>

                    {/* Visibility Toggle */}
                    <button
                        onClick={() => onVisibilityChange(section.id, !section.visible)}
                        className={`p-2 rounded transition-all ${
                            section.visible
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                        title={section.visible ? "Hide section" : "Show section"}
                    >
                        {section.visible ? (
                            <Eye className="w-4 h-4" />
                        ) : (
                            <EyeOff className="w-4 h-4" />
                        )}
                    </button>
                </motion.div>
            ))}
        </div>
    );
}
