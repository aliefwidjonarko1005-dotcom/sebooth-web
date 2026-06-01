import { cn } from "@/lib/utils";
import type { QueueTicketStatus } from "@/types/database";

const STATUS_CONFIG: Record<QueueTicketStatus, { label: string; color: string; dot: string; pulse: boolean }> = {
    waiting: {
        label: "Menunggu",
        color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        dot: "bg-blue-400",
        pulse: false,
    },
    called: {
        label: "Dipanggil! 📣",
        color: "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40",
        dot: "bg-[#D4AF37]",
        pulse: true,
    },
    in_session: {
        label: "Sedang Sesi",
        color: "bg-green-500/15 text-green-300 border-green-500/30",
        dot: "bg-green-400",
        pulse: true,
    },
    completed: {
        label: "Selesai ✅",
        color: "bg-white/10 text-white/60 border-white/20",
        dot: "bg-white/40",
        pulse: false,
    },
    expired: {
        label: "Hangus",
        color: "bg-red-500/15 text-red-400 border-red-500/30",
        dot: "bg-red-400",
        pulse: false,
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-gray-500/15 text-gray-400 border-gray-500/30",
        dot: "bg-gray-400",
        pulse: false,
    },
};

interface QueueStatusBadgeProps {
    status: QueueTicketStatus;
    className?: string;
}

export default function QueueStatusBadge({ status, className }: QueueStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
                config.color,
                className
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full", config.dot, config.pulse && "animate-pulse")} />
            {config.label}
        </span>
    );
}
