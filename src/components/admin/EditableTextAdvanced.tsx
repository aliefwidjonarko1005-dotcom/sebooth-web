"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useAdminEdit } from "./AdminEditProvider";
import { ChevronDown, Palette } from "lucide-react";

interface EditableTextAdvancedProps {
    section: string;
    fieldKey: string;
    defaultValue: string;
    as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
    className?: string;
    children?: React.ReactNode;
    enableStyling?: boolean;
}

interface TextStyle {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: string;
}

export function EditableTextAdvanced({
    section,
    fieldKey,
    defaultValue,
    as: Tag = "span",
    className = "",
    children,
    enableStyling = false,
}: EditableTextAdvancedProps) {
    const { editMode, saveField } = useAdminEdit();
    const ref = useRef<HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [styles, setStyles] = useState<TextStyle>({});
    const originalValue = useRef(defaultValue);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!editMode) return;
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);

            setTimeout(() => {
                if (ref.current) {
                    ref.current.focus();
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(ref.current);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }, 0);
        },
        [editMode]
    );

    const handleBlur = useCallback(async () => {
        setIsEditing(false);
        if (!ref.current) return;
        const newValue = ref.current.innerText.trim();
        if (newValue && newValue !== originalValue.current) {
            originalValue.current = newValue;
            await saveField(section, fieldKey, newValue);
        }
    }, [saveField, section, fieldKey]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (e.key === "Escape") {
                if (ref.current) {
                    ref.current.innerText = originalValue.current;
                }
                setIsEditing(false);
                setShowStyleMenu(false);
                ref.current?.blur();
            }
            if (e.key === "Enter" && !e.shiftKey && Tag !== "p" && Tag !== "div") {
                e.preventDefault();
                ref.current?.blur();
            }
        },
        [Tag]
    );

    const applyStyle = (key: keyof TextStyle, value: string) => {
        const newStyles = { ...styles, [key]: value };
        setStyles(newStyles);
        if (ref.current) {
            ref.current.style[key as any] = value;
        }
        void saveField(
            section,
            `${fieldKey}_style`,
            JSON.stringify(newStyles)
        );
    };

    if (!editMode) {
        return <Tag className={className}>{children || defaultValue}</Tag>;
    }

    const editClasses = [
        className,
        "editable-field",
        isEditing ? "editable-active" : "editable-hover",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="relative">
            <Tag
                ref={ref as React.RefObject<never>}
                className={editClasses}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onClick={handleClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={styles as React.CSSProperties}
                data-testid="editable-text-advanced"
            >
                {children || defaultValue}
            </Tag>

            {/* Style Menu Button */}
            {enableStyling && !isEditing && (
                <button
                    onClick={() => setShowStyleMenu(!showStyleMenu)}
                    className="absolute -top-8 -right-8 p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Edit styles"
                >
                    <Palette className="w-4 h-4" />
                </button>
            )}

            {/* Style Menu Popup */}
            {showStyleMenu && enableStyling && (
                <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black p-4 rounded shadow-lg z-50 min-w-max space-y-3">
                    {/* Font Size */}
                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Font Size
                        </label>
                        <select
                            onChange={(e) =>
                                applyStyle("fontSize", e.target.value)
                            }
                            value={styles.fontSize || ""}
                            className="w-full p-2 border-2 border-black text-sm font-bold"
                        >
                            <option value="">Default</option>
                            <option value="12px">Small</option>
                            <option value="16px">Normal</option>
                            <option value="20px">Large</option>
                            <option value="28px">XL</option>
                            <option value="36px">2XL</option>
                        </select>
                    </div>

                    {/* Font Weight */}
                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Font Weight
                        </label>
                        <select
                            onChange={(e) =>
                                applyStyle("fontWeight", e.target.value)
                            }
                            value={styles.fontWeight || ""}
                            className="w-full p-2 border-2 border-black text-sm font-bold"
                        >
                            <option value="">Normal</option>
                            <option value="400">Regular</option>
                            <option value="600">Semi Bold</option>
                            <option value="700">Bold</option>
                            <option value="900">Black</option>
                        </select>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                onChange={(e) =>
                                    applyStyle("color", e.target.value)
                                }
                                value={styles.color || "#000000"}
                                className="w-12 h-10 border-2 border-black cursor-pointer"
                            />
                            <input
                                type="text"
                                value={styles.color || ""}
                                onChange={(e) =>
                                    applyStyle("color", e.target.value)
                                }
                                placeholder="#000000"
                                className="flex-1 p-2 border-2 border-black text-xs font-bold"
                            />
                        </div>
                    </div>

                    {/* Text Align */}
                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Alignment
                        </label>
                        <div className="flex gap-2">
                            {["left", "center", "right"].map((align) => (
                                <button
                                    key={align}
                                    onClick={() =>
                                        applyStyle("textAlign", align as any)
                                    }
                                    className={`flex-1 py-1 text-xs font-bold border-2 border-black transition-all capitalize ${
                                        styles.textAlign === align
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-black hover:bg-gray-200"
                                    }`}
                                >
                                    {align[0].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setShowStyleMenu(false)}
                        className="w-full mt-3 bg-gray-300 text-black font-bold py-2 px-3 border-2 border-black hover:bg-gray-400 transition-all"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
