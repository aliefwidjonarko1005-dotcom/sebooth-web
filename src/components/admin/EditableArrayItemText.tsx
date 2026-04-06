"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import { useAdminEdit } from "./AdminEditProvider";

interface EditableArrayItemTextProps<T> {
    section: string;
    arrayKey: string;
    items: T[];
    index: number;
    field: keyof T;
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "li";
    className?: string;
    style?: React.CSSProperties;
}

export function EditableArrayItemText<T extends object>({
    section,
    arrayKey,
    items,
    index,
    field,
    as: Tag = "span",
    className = "",
    style,
}: EditableArrayItemTextProps<T>) {
    const { editMode, saveField } = useAdminEdit();
    const ref = useRef<HTMLElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const value = String(items[index]?.[field] ?? "");

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
        if (newValue && newValue !== value) {
            const updatedItems = items.map((item, i) => {
                if (i === index) {
                    return { ...item, [field]: newValue };
                }
                return item;
            });
            await saveField(section, arrayKey, JSON.stringify(updatedItems));
        }
    }, [saveField, section, arrayKey, items, index, field, value]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (e.key === "Escape") {
                if (ref.current) ref.current.innerText = value;
                setIsEditing(false);
                ref.current?.blur();
            }
            if (e.key === "Enter" && !e.shiftKey && Tag !== "p" && Tag !== "div") {
                e.preventDefault();
                ref.current?.blur();
            }
        },
        [Tag, value]
    );

    if (!editMode) {
        return <Tag style={style} className={className}>{value}</Tag>;
    }

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
            {value}
        </Tag>
    );
}
