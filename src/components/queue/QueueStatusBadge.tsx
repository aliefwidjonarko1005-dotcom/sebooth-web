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
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
                <PartyPopper className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-black uppercase tracking-wider">Selesai</span>
            </div>
        );
    }

    if (status === "expired") {
        return (
            <div className="inline-flex items-center gap-1.5 bg-gray-500/10 border border-gray-500/20 rounded-full px-4 py-1.5">
                <XCircle className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-300 text-xs font-black uppercase tracking-wider">Expired</span>
            </div>
        );
    }

    if (status === "cancelled") {
        return (
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5">
                <Ban className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300 text-xs font-black uppercase tracking-wider">Dibatalkan</span>
            </div>
        );
    }

    if (status === "in_session") {
        return (
            <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5"
            >
                <Camera className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-black uppercase tracking-wider">Sedang Berfoto</span>
            </motion.div>
        );
    }

    // For active states, use proximity tier
    const tier: QueueProximityTier = getProximityTier(positionFromFront, status);
    const colors = getProximityTierColor(tier);
    const label = getProximityTierLabel(tier);

    const iconMap: Record<QueueProximityTier, React.ReactNode> = {
        waiting: <Clock className="w-3.5 h-3.5" />,
        approaching: <AlertTriangle className="w-3.5 h-3.5" />,
        preparing: <Zap className="w-3.5 h-3.5" />,
        your_turn: <Zap className="w-3.5 h-3.5" />,
    };

    const shouldPulse = tier === "preparing" || tier === "your_turn";

    return (
        <motion.div
            animate={shouldPulse ? { scale: [1, 1.05, 1] } : {}}
            transition={shouldPulse ? { repeat: Infinity, duration: 1.5 } : {}}
            className={`inline-flex items-center gap-1.5 ${colors.bg} border ${colors.border} rounded-full px-4 py-1.5 relative overflow-hidden`}
        >
            {/* Shimmer effect for your_turn */}
            {tier === "your_turn" && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
            )}
            <span className={`${colors.text} relative`}>{iconMap[tier]}</span>
            <span className={`${colors.text} text-xs font-black uppercase tracking-wider relative`}>
                {label}
            </span>
        </motion.div>
    );
}
