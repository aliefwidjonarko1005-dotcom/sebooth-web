"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function FloatingCTA() {
    return (
        <Link
            href="https://wa.me/6285713899441"
            target="_blank"
            className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-lg hover:bg-[#20bd5a] active:scale-95 transition-all hover:scale-110 flex items-center justify-center safe-bottom"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle className="w-7 h-7 md:w-8 md:h-8 fill-current" />
        </Link>
    );
}
