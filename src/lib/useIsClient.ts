import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/** False on the server and during hydration, true after: gate for createPortal(document.body). */
export function useIsClient() {
    return useSyncExternalStore(subscribeNever, () => true, () => false);
}
