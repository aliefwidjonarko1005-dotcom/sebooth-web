"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, GripVertical, X } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface GalleryMedia {
    id: string;
    name: string;
    url: string;
    caption?: string;
    order: number;
}

interface GalleryMediaEditorProps {
    bucket?: string;
    onMediaUpdate?: (media: GalleryMedia[]) => void;
}

export function GalleryMediaEditor({
    bucket = "gallery",
    onMediaUpdate,
}: GalleryMediaEditorProps) {
    const [media, setMedia] = useState<GalleryMedia[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingCaption, setEditingCaption] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const supabase = createClient();
            const timestamp = Date.now();
            const fileName = `gallery-${timestamp}-${file.name}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrl } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            const newMedia: GalleryMedia = {
                id: timestamp.toString(),
                name: fileName,
                url: publicUrl.publicUrl,
                caption: "",
                order: media.length,
            };

            const updated = [...media, newMedia];
            setMedia(updated);
            onMediaUpdate?.(updated);
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm("Delete this image?")) return;

        try {
            const supabase = createClient();
            await supabase.storage.from(bucket).remove([name]);

            const updated = media.filter((m) => m.id !== id);
            setMedia(updated);
            onMediaUpdate?.(updated);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleReorder = (fromIdx: number, toIdx: number) => {
        const updated = [...media];
        const [item] = updated.splice(fromIdx, 1);
        updated.splice(toIdx, 0, item);
        updated.forEach((m, i) => (m.order = i));
        setMedia(updated);
        onMediaUpdate?.(updated);
    };

    return (
        <div className="space-y-4 p-4 bg-white border-2 border-black">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-text-dark">
                    Gallery Media Manager
                </h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-secondary text-white font-bold px-4 py-2 border-2 border-black hover:bg-secondary/90 transition-all disabled:opacity-50"
                >
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload Image"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item, idx) => (
                    <div
                        key={item.id}
                        draggable
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const draggedIdx = parseInt(e.dataTransfer.getData("text"));
                            handleReorder(draggedIdx, idx);
                        }}
                        className="relative group border-2 border-black overflow-hidden bg-gray-100 aspect-square cursor-move hover:opacity-80 transition-opacity"
                    >
                        {/* Image */}
                        <img
                            src={item.url}
                            alt={item.caption || "Gallery image"}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />

                        {/* Order Indicator */}
                        <div className="absolute top-1 left-1 bg-black text-white px-2 py-1 text-xs font-bold">
                            #{idx + 1}
                        </div>

                        {/* Hover Controls */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <GripVertical className="w-5 h-5 text-white" />
                            <span className="text-white text-xs font-bold text-center">
                                Drag to reorder
                            </span>
                            <button
                                onClick={() => setEditingCaption(item.id)}
                                className="w-full bg-blue-500 text-white text-xs font-bold py-1 px-2 hover:bg-blue-600 border border-white"
                            >
                                Edit Caption
                            </button>
                            <button
                                onClick={() =>
                                    handleDelete(item.id, item.name)
                                }
                                className="w-full bg-red-500 text-white text-xs font-bold py-1 px-2 hover:bg-red-600 border border-white flex items-center justify-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>

                        {/* Caption Badge */}
                        {item.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 truncate">
                                {item.caption}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Caption Editor Modal */}
            {editingCaption && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white border-4 border-black p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black uppercase text-text-dark">
                                Edit Caption
                            </h4>
                            <button
                                onClick={() => setEditingCaption(null)}
                                className="text-text-dark hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Enter caption..."
                            defaultValue={
                                media.find((m) => m.id === editingCaption)
                                    ?.caption || ""
                            }
                            onChange={(e) => {
                                const updated = media.map((m) =>
                                    m.id === editingCaption
                                        ? { ...m, caption: e.target.value }
                                        : m
                                );
                                setMedia(updated);
                            }}
                            className="w-full p-3 border-2 border-black mb-4 font-bold uppercase text-sm"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    onMediaUpdate?.(media);
                                    setEditingCaption(null);
                                }}
                                className="flex-1 bg-green-500 text-white font-bold py-2 px-4 border-2 border-black hover:bg-green-600 transition-all"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingCaption(null)}
                                className="flex-1 bg-gray-300 text-black font-bold py-2 px-4 border-2 border-black hover:bg-gray-400 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
