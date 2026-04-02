"use client";

import { useState } from "react";
import { TextEditModal } from "./TextEditModal";

interface PreviewEditOverlayProps {
    onTextClick: (text: string, section: string, fieldKey: string) => void;
}

export function PreviewEditOverlay({ onTextClick }: PreviewEditOverlayProps) {
    const [editingText, setEditingText] = useState<{
        text: string;
        section: string;
        fieldKey: string;
    } | null>(null);

    // Inject CSS to highlight clickable text in preview
    const overlayStyles = `
        <style id="preview-edit-overlay-styles">
            .sebooth-editable-text {
                position: relative;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            
            .sebooth-editable-text:hover {
                background-color: rgba(59, 130, 246, 0.2) !important;
                outline: 2px dashed #3B82F6;
                outline-offset: 2px;
            }
            
            .sebooth-editable-text::after {
                content: '✎';
                position: absolute;
                top: -8px;
                right: -8px;
                background: #3B82F6;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                opacity: 0;
                transition: opacity 0.15s ease;
            }
            
            .sebooth-editable-text:hover::after {
                opacity: 1;
            }
        </style>
    `;

    return (
        <>
            {/* Inject styles into preview */}
            <div dangerouslySetInnerHTML={{ __html: overlayStyles }} />

            {/* Text Edit Modal */}
            <TextEditModal
                isOpen={editingText !== null}
                currentText={editingText?.text || ""}
                label={`Editing: ${editingText?.fieldKey || ""}`}
                onSave={(newText) => {
                    if (editingText) {
                        onTextClick(newText, editingText.section, editingText.fieldKey);
                    }
                }}
                onClose={() => setEditingText(null)}
            />

            {/* Note for preview iframe */}
            <div
                className="text-xs text-primary/50 font-bold p-2 bg-blue-50 border-t-2 border-blue-200 text-center"
                style={{ fontSize: "11px" }}
            >
                ℹ️ Click on text in preview to edit it directly. Updates save automatically.
            </div>
        </>
    );
}
