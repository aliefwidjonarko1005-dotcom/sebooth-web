"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function FloatingCTA() {
    return (
        <Link
            href="https://wa.me/6281234567890" // Replace with actual number
            target="_blank"
            className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
        </Link>
    );
}
