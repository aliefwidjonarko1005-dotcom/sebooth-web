import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UserLiveTicket } from "@/lib/queue/fetchUserActiveTickets";
import type { QueueTicketStatus } from "@/types/database";
import { FLOW_HEADING } from "@/components/ui/FlowHero";

const STATUS_LABEL: Partial<Record<QueueTicketStatus, string>> = {
    waiting: "Menunggu giliran",
    called: "Giliranmu, segera ke booth",
    in_session: "Sedang berfoto",
};

/** The numbers someone already holds, so closing the ticket page never costs them their place. */
export default function ActiveQueueCard({ tickets }: { tickets: UserLiveTicket[] }) {
    if (tickets.length === 0) return null;

    return (
        <section className="mb-12">
            <h2 className={FLOW_HEADING}>Tiketmu</h2>
            <ul className="mt-4 space-y-3">
                {tickets.map((ticket) => (
                    <li key={ticket.id}>
                        <Link
                            href={`/queue/${ticket.event_id}/ticket/${ticket.id}`}
                            className="flex min-h-20 items-center gap-4 rounded-lg bg-primary p-4 text-white transition-colors hover:bg-navy-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99]"
                        >
                            <span className="text-[2.5rem] leading-none font-extrabold tabular-nums">
                                {String(ticket.queue_number).padStart(3, "0")}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-lg leading-snug font-bold">{ticket.queue_events?.name}</span>
                                <span className="mt-0.5 block text-[15px] leading-snug text-white/85">{STATUS_LABEL[ticket.status]}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
