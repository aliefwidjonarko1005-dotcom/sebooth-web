"use client";

import { useState, useRef } from "react";
import { Upload, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAdminEdit } from "./AdminEditProvider";
import { ImageCropModal } from "./ImageCropModal";

interface EditableImageProps {
    section: string;
    fieldKey: string;
    defaultValue: string;
    bucket?: string;
    className?: string;
    altText?: string;
    aspectRatio?: number;
    onUpload?: (url: string) => void;
}

export function EditableImage({
    section,
    fieldKey,
    defaultValue,
    bucket = "gallery",
    className = "",
    altText = "Editable image",
    aspectRatio,
    onUpload,
}: EditableImageProps) {
    const { editMode, saveField } = useAdminEdit();
    const [imageUrl, setImageUrl] = useState(defaultValue);
    const [isUploading, setIsUploading] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [cropFile, setCropFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCropFile(file);
        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    const handleCropConfirm = async () => {
        if (!cropFile) return;
        setCropFile(null);
        setIsUploading(true);
        try {
            const { createClient } = await import("@/lib/supabase");
            const supabase = createClient();
            const timestamp = Date.now();
            const ext = cropFile.name.split('.').pop() || 'jpg';
            const fileName = `${section}-${fieldKey}-${timestamp}.${ext}`;

            // Upload ORIGINAL file directly — no canvas re-encoding, preserving full quality
            const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, cropFile, { contentType: cropFile.type });

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
        const src = imageUrl || defaultValue;
        if (!src) return null;
        return (
            <img
                src={src}
                alt={altText}
                className={className}
            />
        );
    }

    const src = imageUrl || defaultValue;

    return (
        <>
            <div className="relative group w-full h-full">
                {src ? (
                    <img
                        src={src}
                        alt={altText}
                        className={`${className} border-2 border-dashed border-blue-400 cursor-pointer group-hover:opacity-80 transition-opacity`}
                    />
                ) : (
                    <div className={`${className} border-2 border-dashed border-blue-400 cursor-pointer group-hover:opacity-80 transition-opacity bg-gray-100 flex items-center justify-center`}>
                        <span className="text-gray-400 font-bold text-xs uppercase">Click to upload</span>
                    </div>
                )}

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

            {/* Crop Modal */}
            {cropFile && (
                <ImageCropModal
                    file={cropFile}
                    aspectRatio={aspectRatio}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropFile(null)}
                />
            )}
        </>
    );
}

