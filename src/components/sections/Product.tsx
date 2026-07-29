"use client";

import { cn } from "@/lib/utils";
import { parseJsonContent } from "@/lib/useSiteContent";
import { EditableText } from "@/components/admin/EditableText";
import { EditableArrayItemText } from "@/components/admin/EditableArrayItemText";
import { motion } from "framer-motion";
import { Camera, Sparkles, Handshake } from "lucide-react";

interface ProductItem {
    id: string;
    name: string;
    description: string;
}

const defaultProducts: ProductItem[] = [
    {
        id: "unlimited",
        name: "Mau Foto Sepuasnya",
        description: "Kamu bisa foto terus-terusan secara unlimited",
    },
    {
        id: "fun",
        name: "Mau Foto-foto asyik aja",
        description: "Foto-foto bareng temen-temen kamu",
    },
    {
        id: "partner",
        name: "Mau jadi partner kita",
        description: "Kalo ini, chat langsung aja ama admin kami",
    },
];

const defaultContent = {
    section_title: "Sebutin Apa Yang Loe Mau!",
    section_tag: "[ OUR SERVICES ]",
    items: "",
};

interface ProductProps {
    initialData?: Record<string, string>;
}

export function Product({ initialData = {} }: ProductProps) {
    const content = { ...defaultContent, ...initialData };
    
    let products = parseJsonContent<ProductItem[]>(content.items, defaultProducts);

    // If the database has the old default items, override them with the new ones
    if (products.length === 0 || products.some(p => p.id === "standard" || p.id === "deluxe" || p.id === "glamour" || p.id === "zero-lag")) {
        products = defaultProducts;
    }

    const getIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Camera className="w-10 h-10 text-secondary" />;
            case 1:
                return <Sparkles className="w-10 h-10 text-secondary" />;
            case 2:
                return <Handshake className="w-10 h-10 text-secondary" />;
            default:
                return <Camera className="w-10 h-10 text-secondary" />;
        }
    };

    return (
        <section id="product" className="py-24 px-6 md:px-20 bg-transparent paper-texture">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((product, idx) => (
                    <motion.div
                        key={product.id || idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="glass-card p-8 md:p-10 flex flex-col items-center text-center justify-center min-h-[360px] transition-all duration-300 group hover:-translate-y-2"
                    >
                        {/* Icon Placeholder Container */}
                        <div className="glass-card-icon-container w-20 h-20 bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner transition-transform duration-300 group-hover:scale-110">
                            {getIcon(idx)}
                        </div>

                        {/* Title */}
                        <EditableArrayItemText 
                            section="product" 
                            arrayKey="items" 
                            items={products} 
                            index={idx} 
                            field="name" 
                            as="h3" 
                            className="text-2xl font-black uppercase mb-3 text-text-dark tracking-tight leading-tight" 
                        />

                        {/* Description */}
                        <EditableArrayItemText 
                            section="product" 
                            arrayKey="items" 
                            items={products} 
                            index={idx} 
                            field="description" 
                            as="p" 
                            className="text-sm font-semibold uppercase text-text-dark/70 leading-relaxed max-w-[240px]" 
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
