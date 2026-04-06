"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";
import { EditableImage } from "@/components/admin/EditableImage";
import { EditableArrayItemText } from "@/components/admin/EditableArrayItemText";

interface ProductItem {
    id: string;
    name: string;
    tagline: string;
    description: string;
    specs: string[];
    colSpan: string;
    shadow: string;
    badge?: string;
}

const defaultProducts: ProductItem[] = [
    {
        id: "standard",
        name: "Standard",
        tagline: "Digital-First Experience",
        description: "Basic high-quality digital setup for small intimate gatherings.",
        specs: ["Unlimited Digital Shots", "Basic Props Kit", "Instant QR Download", "Online Gallery Access"],
        colSpan: "md:col-span-4",
        shadow: "hard-shadow-black",
    },
    {
        id: "deluxe",
        name: "Deluxe",
        tagline: "The Professional Choice",
        description: "Full professional lighting, custom backdrops, and physical printouts for your guests.",
        specs: ["Unlimited Physical Prints", "Premium Backdrop Selection", "DNP RX1 HS High-Speed Printing", "On-site Technical Assistant"],
        colSpan: "md:col-span-8",
        shadow: "hard-shadow-blue",
    },
    {
        id: "glamour",
        name: "Glamour",
        tagline: "Studio Elegance",
        description: "Kardashian-style skin softening filters and black & white editorial finish.",
        specs: ["Black & White Signature", "High-End Studio Lighting", "Beauty Filter Integration", "Luxury Visuals"],
        colSpan: "md:col-span-7",
        shadow: "hard-shadow-orange",
        badge: "POPULAR",
    },
    {
        id: "zero-lag",
        name: "Zero-Lag",
        tagline: "Instant Delivery",
        description: "Instant digital delivery via QR. No queues, no waiting, just pure fun.",
        specs: ["Instant QR Gallery", "Zero Wait Time", "Real-Time Cloud Upload", "Guest Self-Service"],
        colSpan: "md:col-span-5",
        shadow: "hard-shadow-black",
    },
];

const defaultContent = {
    section_title: "OUR SERVICES",
    section_tag: "[ 01 — EQUIPMENT & PACKAGES ]",
    items: "",
    pro_title: "Pro Hardware",
    pro_description: "We use DSLR cameras, studio-grade strobes, and industrial dye-sublimation printers. No webcams allowed.",
};

interface ProductProps {
    initialData?: Record<string, string>;
}

export function Product({ initialData = {} }: ProductProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const content = { ...defaultContent, ...initialData };
    
    const products = parseJsonContent<ProductItem[]>(content.items, defaultProducts);

    const toggleProduct = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <section id="product" className="py-24 px-6 md:px-20 bg-white paper-texture">
            {/* Section Header */}
            <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b-8 border-black pb-4">
                <EditableText section="product" fieldKey="section_title" defaultValue={content.section_title} as="h2" className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-text-dark">
                    {content.section_title}
                </EditableText>
                <EditableText section="product" fieldKey="section_tag" defaultValue={content.section_tag} as="p" className="text-lg font-bold uppercase text-primary mb-2">
                    {content.section_tag}
                </EditableText>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {products.map((product, idx) => (
                    <div
                        key={product.id}
                        className={cn(
                            "bg-white p-8 border-2 border-black cursor-pointer group hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200 ease-out",
                            product.colSpan,
                            product.shadow
                        )}
                        onClick={() => toggleProduct(product.id)}
                    >
                        {/* Card Header */}
                        <div className="mb-4 flex justify-between items-start">
                            <div>
                                <EditableArrayItemText section="product" arrayKey="items" items={products} index={idx} field="name" as="h3" className="text-3xl font-black uppercase mb-1 text-text-dark" />
                                <EditableArrayItemText section="product" arrayKey="items" items={products} index={idx} field="tagline" as="p" className="text-sm font-bold uppercase tracking-wide text-primary" />
                            </div>
                            {product.badge && (
                                <span className="bg-secondary text-white text-xs px-2 py-1 font-bold border border-black">
                                    {product.badge}
                                </span>
                            )}
                        </div>

                        <EditableArrayItemText section="product" arrayKey="items" items={products} index={idx} field="description" as="p" className="font-bold uppercase text-text-dark mb-4" />

                        {/* Expandable Specs — CSS grid transition */}
                        <div className={expandedId === product.id ? "grid-expand" : "grid-collapse"}>
                            <div className="grid-inner">
                                <div className="border-t-2 border-black pt-6 mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3">
                                        {product.specs.map((spec, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 shrink-0 text-secondary" />
                                                <span className="text-sm font-bold uppercase text-text-dark">
                                                    {spec}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Pro Hardware Banner */}
                <div className="md:col-span-12 bg-primary text-white p-12 border-2 border-black flex flex-col md:flex-row justify-between items-center gap-8 hard-shadow-orange">
                    <div className="max-w-xl">
                        <EditableText section="product" fieldKey="pro_title" defaultValue={content.pro_title} as="h3" className="text-4xl md:text-5xl font-black uppercase mb-4 leading-none text-white">
                            {content.pro_title}
                        </EditableText>
                        <EditableText section="product" fieldKey="pro_description" defaultValue={content.pro_description} as="p" className="text-lg font-bold uppercase text-white">
                            {content.pro_description}
                        </EditableText>
                    </div>
                    <div className="w-full md:w-64 h-48 border-4 border-white overflow-hidden flex items-center justify-center bg-white/10">
                        {initialData["equipment_image"] ? (
                            <EditableImage
                                section="product"
                                fieldKey="equipment_image"
                                defaultValue={initialData["equipment_image"]}
                                className="w-full h-full object-cover"
                                altText="Equipment Photo"
                            />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <EditableImage
                                    section="product"
                                    fieldKey="equipment_image"
                                    defaultValue=""
                                    className="w-full h-full object-cover"
                                    altText="Equipment Photo"
                                />
                                <span className="absolute text-white/40 font-bold uppercase text-sm pointer-events-none">[Equipment Photo]</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
