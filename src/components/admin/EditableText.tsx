"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import { useAdminEdit } from "./AdminEditProvider";

interface EditableTextProps {
    section: string;
    fieldKey: string;
    defaultValue: string;
    as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export function EditableText({
    section,
    fieldKey,
    defaultValue,
    as: Tag = "span",
    className = "",
    style,
    children,
}: EditableTextProps) {
    const { editMode, saveField } = useAdminEdit();
    const ref = useRef<HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const originalValue = useRef(defaultValue);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!editMode) return;
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
            // Focus the element after render
            setTimeout(() => {
                if (ref.current) {
                    ref.current.focus();
                    // Place cursor at end
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
                // Revert changes
                if (ref.current) {
                    ref.current.innerText = originalValue.current;
                }
                setIsEditing(false);
                ref.current?.blur();
            }
            if (e.key === "Enter" && !e.shiftKey && Tag !== "p" && Tag !== "div") {
                e.preventDefault();
                ref.current?.blur();
            }
        },
        [Tag]
    );

    // In normal mode (not admin or not edit mode), render children or defaultValue
    if (!editMode) {
        return <Tag style={style} className={className}>{children || defaultValue}</Tag>;
    }

    // Edit mode styles
    const editClasses = [
        className,
        "editable-field",
        isEditing ? "editable-active" : "editable-hover",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Tag
            ref={ref as React.RefObject<never>}
            className={editClasses}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{ ...style, outline: "none" }}
        >
            {children || defaultValue}
        </Tag>
    );
}
