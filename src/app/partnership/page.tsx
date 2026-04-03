import type { Metadata } from "next";
import { fetchPartnershipPageContent } from "@/lib/serverSupabase";
import { PartnershipContent } from "@/components/sections/PartnershipContent";

// ═══════════════════════════════════════════════════════
// ISR: Revalidate every 60 seconds
// ═══════════════════════════════════════════════════════
export const revalidate = 60;

export const metadata: Metadata = {
    title: "Partnership | Sebooth — The Best Friend of EOs & WOs",
    description:
        "Bergabunglah dengan jaringan partner Sebooth. Komisi transparan, opsi whitelabel, dan koordinator dedikasi untuk setiap event Anda.",
    openGraph: {
        title: "Partnership | Sebooth",
        description:
            "Bergabunglah dengan jaringan partner Sebooth. Komisi transparan, opsi whitelabel, dan koordinator dedikasi.",
        type: "website",
    },
};

export default async function PartnershipPage() {
    const content = await fetchPartnershipPageContent();

    return <PartnershipContent content={content} />;
}
