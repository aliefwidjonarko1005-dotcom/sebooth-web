import { Ban, Camera, Check, Clock, AlertTriangle, XCircle, Zap } from "lucide-react";
import type { QueueTicketStatus, QueueProximityTier } from "@/types/database";
import { getProximityTier, getProximityTierLabel, getProximityTierColor } from "@/types/database";

interface QueueStatusBadgeProps {
    status: QueueTicketStatus;
    positionFromFront?: number;
}

const PILL = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold";

const FIXED_STATES: Partial<Record<QueueTicketStatus, { label: string; className: string; Icon: typeof Clock }>> = {
    completed: { label: "Selesai", className: "bg-green-700 text-white", Icon: Check },
    expired: { label: "Expired", className: "bg-slate-300 text-slate-800", Icon: XCircle },
    cancelled: { label: "Dibatalkan", className: "bg-red-600 text-white", Icon: Ban },
    in_session: { label: "Sedang Berfoto", className: "bg-green-700 text-white", Icon: Camera },
};

const TIER_ICONS: Record<QueueProximityTier, typeof Clock> = {
    waiting: Clock,
    approaching: AlertTriangle,
    preparing: Zap,
    your_turn: Zap,
};

/** Ticket status as a small pill, for the operator's list. */
export default function QueueStatusBadge({ status, positionFromFront = 0 }: QueueStatusBadgeProps) {
    const fixed = FIXED_STATES[status];
    if (fixed) {
        return (
            <span className={`${PILL} ${fixed.className}`}>
                <fixed.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {fixed.label}
            </span>
        );
    }

    // For active states, use proximity tier
    const tier = getProximityTier(positionFromFront, status);
    const colors = getProximityTierColor(tier);
    const Icon = TIER_ICONS[tier];

    return (
        <span className={`${PILL} ${colors.bg} ${colors.text}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {getProximityTierLabel(tier)}
        </span>
    );
}
