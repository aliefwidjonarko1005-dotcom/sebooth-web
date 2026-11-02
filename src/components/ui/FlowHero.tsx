import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const BUTTON =
    "flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full px-6 text-[17px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
export const FLOW_BUTTON_ORANGE = `${BUTTON} bg-secondary text-blue-dark hover:bg-orange-press`;
export const FLOW_BUTTON_NAVY = `${BUTTON} bg-primary text-white hover:bg-navy-raised`;
export const FLOW_HEADING = "font-bayon text-[1.75rem] leading-[1.05] text-primary uppercase";

interface FlowHeroProps {
    title: string;
    /** Sits opposite the logo, e.g. the guide button. */
    action?: ReactNode;
    children?: ReactNode;
}

/** Navy top of the task pages (queue, login, register). They have no site header, so the logo is the way home. */
export function FlowHero({ title, action, children }: FlowHeroProps) {
    return (
        <header className="bg-primary px-5 pt-4 pb-9 text-white">
            <div className="mx-auto max-w-xl">
                <div className="flex min-h-11 items-center justify-between gap-3">
                    <Link
                        href="/"
                        aria-label="Sebooth, kembali ke beranda"
                        className="-ml-1 flex min-h-11 items-center px-1 focus-visible:outline-2 focus-visible:outline-white"
                    >
                        <Image src="/images/logo/sebooth-white.svg" alt="" width={67} height={28} unoptimized priority className="h-7 w-auto" />
                    </Link>
                    {action}
                </div>
                <h1 className="mt-8 font-bayon text-[2.75rem] leading-none uppercase md:text-[clamp(3rem,4.6vw,4.5rem)]">{title}</h1>
                {children}
            </div>
        </header>
    );
}
