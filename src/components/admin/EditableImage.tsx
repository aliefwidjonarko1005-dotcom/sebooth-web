"use client";

import { useState, useRef } from "react";
import { Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAdminEdit } from "./AdminEditProvider";

interface EditableImageProps {
    section: string;
    fieldKey: string;
    defaultValue: string;
    bucket?: string;
    className?: string;
    altText?: string;
    onUpload?: (url: string) => void;
}

export function EditableImage({
    section,
    fieldKey,
    defaultValue,
    bucket = "gallery",
    className = "",
    altText = "Editable image",
    onUpload,
}: EditableImageProps) {
    const { editMode, saveField } = useAdminEdit();
    const [imageUrl, setImageUrl] = useState(defaultValue);
    const [isUploading, setIsUploading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { createClient } = await import("@/lib/supabase");
            const supabase = createClient();
            const timestamp = Date.now();
            const fileName = `${section}-${fieldKey}-${timestamp}-${file.name}`;

            const { error, data } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setImageUrl(publicUrl.publicUrl);
            await saveField(section, fieldKey, publicUrl.publicUrl);
            onUpload?.(publicUrl.publicUrl);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    if (!editMode) {
        return (
            <img
                src={imageUrl || defaultValue}
                alt={altText}
                className={className}
            />
        );
    }

    return (
        <div className="relative group">
            <img
                src={imageUrl || defaultValue}
                alt={altText}
                className={`${className} border-2 border-dashed border-blue-400 cursor-pointer group-hover:opacity-80 transition-opacity`}
            />

            {/* Hover Controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-white text-black p-2 rounded font-bold hover:bg-blue-500 hover:text-white transition-all"
                    title="Replace image"
                >
                    <Upload className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="bg-white text-black p-2 rounded font-bold hover:bg-blue-500 hover:text-white transition-all"
                    title="Show options"
                >
                    {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Upload Status */}
            {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold animate-pulse">Uploading...</span>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Expanded Controls */}
            {showControls && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black p-4 shadow-lg z-50 space-y-3">
                    <div>
                        <label className="block text-xs font-bold mb-2">Image URL:</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-2 border-2 border-black text-sm"
                        />
                        <button
                            onClick={() => saveField(section, fieldKey, imageUrl)}
                            className="mt-2 w-full bg-blue-500 text-white font-bold py-1 px-3 hover:bg-blue-600 border-2 border-black"
                        >
                            Update URL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
