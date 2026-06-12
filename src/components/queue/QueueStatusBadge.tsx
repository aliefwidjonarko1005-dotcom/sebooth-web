"use client";

import { motion } from "framer-motion";
import { Clock, AlertTriangle, Zap, PartyPopper, Camera, XCircle, Ban } from "lucide-react";
import type { QueueTicketStatus, QueueProximityTier } from "@/types/database";
import { getProximityTier, getProximityTierLabel, getProximityTierColor } from "@/types/database";

interface QueueStatusBadgeProps {
    status: QueueTicketStatus;
    positionFromFront?: number;
}

export default function QueueStatusBadge({ status, positionFromFront = 0 }: QueueStatusBadgeProps) {
    // For terminal states, use status-based rendering
    if (status === "completed") {
        return (
            <div className="inline-flex items-center gap-2 bg-green-500 text-white border-2 border-black hard-shadow-black px-4 py-1.5">
                <PartyPopper className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Selesai</span>
            </div>
        );
    }

    if (status === "expired") {
        return (
            <div className="inline-flex items-center gap-2 bg-gray-300 text-gray-800 border-2 border-black hard-shadow-black px-4 py-1.5">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Expired</span>
            </div>
        );
    }

    if (status === "cancelled") {
        return (
            <div className="inline-flex items-center gap-2 bg-red-500 text-white border-2 border-black hard-shadow-black px-4 py-1.5">
                <Ban className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Dibatalkan</span>
            </div>
        );
    }

    if (status === "in_session") {
        return (
            <motion.div
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="inline-flex items-center gap-2 bg-green-500 text-white border-2 border-black hard-shadow-black px-4 py-1.5"
            >
                <Camera className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Sedang Berfoto</span>
            </motion.div>
        );
    }

    // For active states, use proximity tier
    const tier: QueueProximityTier = getProximityTier(positionFromFront, status);
    const colors = getProximityTierColor(tier);
    const label = getProximityTierLabel(tier);

    const iconMap: Record<QueueProximityTier, React.ReactNode> = {
        waiting: <Clock className="w-4 h-4" />,
        approaching: <AlertTriangle className="w-4 h-4" />,
        preparing: <Zap className="w-4 h-4" />,
        your_turn: <Zap className="w-4 h-4" />,
    };

    const shouldPulse = tier === "preparing" || tier === "your_turn";

    return (
        <motion.div
            animate={shouldPulse ? { scale: [1, 1.05, 1] } : {}}
            transition={shouldPulse ? { repeat: Infinity, duration: 0.5 } : {}}
            className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} ${colors.border} hard-shadow-black px-4 py-1.5 relative overflow-hidden`}
        >
            {/* Shimmer effect for your_turn */}
            {tier === "your_turn" && (
                <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            )}
            <span className="relative">{iconMap[tier]}</span>
            <span className="text-[0.7rem] font-black uppercase tracking-widest relative mt-0.5">
                {label}
            </span>
        </motion.div>
    );
}
