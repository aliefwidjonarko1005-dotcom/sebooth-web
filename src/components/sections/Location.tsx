"use client";

import { EditableText } from "@/components/admin/EditableText";

const defaultContent = {
    title: "Visit Our Studio",
    name: "Sebooth HQ",
    address: "Jl. Photobooth Premium No. 12\nSemarang Selatan, Jawa Tengah 50241",
    maps_url: "https://maps.google.com",
};

interface LocationProps {
    initialData?: Record<string, string>;
}

export function Location({ initialData = {} }: LocationProps) {
    const content = { ...defaultContent, ...initialData };

    return (
        <section id="location" className="py-0">
            <div className="w-full h-[600px] bg-[#E5E5E5] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[#0F3D2E]/5 z-10 pointer-events-none" />
                <div className="text-center space-y-4 z-20">
                    <EditableText section="location" fieldKey="title" defaultValue={content.title} as="h2" className="text-3xl font-bold text-[#1A1A1A] font-sebooth">
                        {content.title}
                    </EditableText>
                    <div className="bg-white p-6 shadow-xl max-w-sm mx-auto">
                        <EditableText section="location" fieldKey="name" defaultValue={content.name} as="p" className="font-bold text-[#1A1A1A]">
                            {content.name}
                        </EditableText>
                        <EditableText section="location" fieldKey="address" defaultValue={content.address} as="p" className="text-[#1A1A1A]/70 text-sm mt-2">
                            {content.address}
                        </EditableText>
                        <a
                            href={content.maps_url}
                            target="_blank"
                            className="block mt-4 text-[#0F3D2E] font-bold text-sm hover:underline"
                        >
                            Get Directions &rarr;
                        </a>
                    </div>
                    <p className="text-[#1A1A1A]/30 font-bold">[Google Maps Embed Placeholder]</p>
                </div>
            </div>
        </section>
    );
}
