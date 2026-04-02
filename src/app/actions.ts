"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the homepage and all public pages that depend on site_content.
 * Called after admin edits content via the inline editor or CMS panel.
 */
export async function revalidateSiteContent() {
    // Homepage (all sections)
    revalidatePath("/", "page");
    // About page (may reference site_content)
    revalidatePath("/about", "page");
    // Partnership page
    revalidatePath("/partnership", "page");
}

/**
 * Revalidates a specific page path.
 * Useful for targeted cache invalidation.
 */
export async function revalidateSpecificPage(path: string) {
    revalidatePath(path, "page");
}
