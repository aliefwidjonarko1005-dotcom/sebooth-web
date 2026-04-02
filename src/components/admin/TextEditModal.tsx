"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface TextEditModalProps {
    isOpen: boolean;
    currentText: string;
    label: string;
    onSave: (newText: string) => void;
    onClose: () => void;
}

export function TextEditModal({
    isOpen,
    currentText,
    label,
    onSave,
    onClose,
}: TextEditModalProps) {
    const [editedText, setEditedText] = useState(currentText);

    if (!isOpen) return null;

    const handleSave = () => {
        if (editedText.trim()) {
            onSave(editedText);
        }
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[99999] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white border-4 border-black max-w-2xl w-full shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-black bg-primary text-white">
                    <h3 className="text-lg font-black uppercase">
                        ✏️ Edit Text
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-black uppercase text-text-dark mb-2">
                            {label || "Content"}
                        </label>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            autoFocus
                            rows={6}
                            className="w-full p-4 border-2 border-black font-bold uppercase text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="Enter text here..."
                        />
                        <div className="text-xs text-primary/60 mt-2 font-bold">
                            {editedText.length} characters
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-xs font-black uppercase text-text-dark mb-2">
                            📋 Preview
                        </label>
                        <div className="p-4 bg-gray-50 border-2 border-primary/30 min-h-[60px] text-text-dark font-bold word-break">
                            {editedText || "(empty)"}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t-4 border-black bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-black font-black uppercase py-3 px-4 border-2 border-black hover:bg-gray-400 transition-all"
                    >
                        ✕ Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-green-500 text-white font-black uppercase py-3 px-4 border-2 border-black hover:bg-green-600 transition-all"
                    >
                        ✓ Save Changes
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
