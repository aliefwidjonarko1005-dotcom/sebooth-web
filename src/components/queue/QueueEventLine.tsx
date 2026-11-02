/** Event name and booth, under the title of a page that belongs to one event. */
export function QueueEventLine({ name, booth }: { name: string; booth: string }) {
    return (
        <>
            <p className="mt-3 text-xl leading-snug font-semibold">{name}</p>
            <p className="mt-0.5 text-[17px] leading-snug text-white/85">{booth}</p>
        </>
    );
}
