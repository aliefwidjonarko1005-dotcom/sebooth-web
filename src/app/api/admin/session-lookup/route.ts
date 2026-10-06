import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAdminUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Safe to ignore in route handlers
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const userEmail = (user.email || "").toLowerCase().trim();
    const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    if (envAdmins.includes(userEmail)) {
        return user;
    }

    const { data: adminRecord } = await supabase
        .from("admins")
        .select("id, email, is_super")
        .eq("email", userEmail)
        .maybeSingle();

    if (adminRecord) {
        return user;
    }

    return null;
}

function createServiceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * GET /api/admin/session-lookup?id=<sessionId>&limit=<number>
 * - If `id` is provided: Looks up specific session by ID or search term.
 * - If `id` is not provided: Returns recent sessions for quick selection.
 */
export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const queryId = searchParams.get("id")?.trim();

        const supabase = createServiceClient();

        // CASE 1: Query single session in detail
        if (queryId) {
            // 1. Fetch session
            const { data: session, error: sessionErr } = await supabase
                .from("sessions")
                .select("id, created_at, event_name, user_id, is_claimed, queue_ticket_id")
                .eq("id", queryId)
                .maybeSingle();

            if (sessionErr) {
                return NextResponse.json({ success: false, error: sessionErr.message }, { status: 500 });
            }

            if (!session) {
                return NextResponse.json({ success: false, error: "Sesi tidak ditemukan dengan ID tersebut." }, { status: 404 });
            }

            // 2. Fetch User Profile if user_id exists
            let userInfo: {
                id: string;
                email: string | null;
                full_name: string | null;
                phone_number: string | null;
                instagram?: string | null;
                referral_source?: string | null;
                created_at: string | null;
            } | null = null;

            if (session.user_id) {
                try {
                    const { data: userData } = await supabase.auth.admin.getUserById(session.user_id);
                    if (userData?.user) {
                        const u = userData.user;
                        userInfo = {
                            id: u.id,
                            email: u.email || null,
                            full_name: (u.user_metadata?.full_name as string) || null,
                            phone_number: (u.user_metadata?.phone_number as string) || (u.phone as string) || null,
                            instagram: (u.user_metadata?.instagram as string) || null,
                            referral_source: (u.user_metadata?.referral_source as string) || (u.user_metadata?.heard_from as string) || null,
                            created_at: u.created_at || null,
                        };
                    }
                } catch {
                    userInfo = {
                        id: session.user_id,
                        email: null,
                        full_name: null,
                        phone_number: null,
                        instagram: null,
                        referral_source: null,
                        created_at: null,
                    };
                }
            }

            // 3. Fetch linked Queue Ticket if any
            let queueTicket: {
                id: string;
                queue_number: number;
                display_name: string;
                phone_number: string | null;
                status: string;
                event_name?: string;
                created_at: string;
            } | null = null;

            const { data: ticketData } = await supabase
                .from("queue_tickets")
                .select("id, queue_number, display_name, phone_number, status, created_at, queue_events(name, booth_name)")
                .or(`session_id.eq.${queryId},id.eq.${session.queue_ticket_id || queryId}`)
                .maybeSingle();

            if (ticketData) {
                const eventInfo = ticketData.queue_events as unknown as { name: string; booth_name: string } | null;
                queueTicket = {
                    id: ticketData.id,
                    queue_number: ticketData.queue_number,
                    display_name: ticketData.display_name,
                    phone_number: ticketData.phone_number,
                    status: ticketData.status,
                    event_name: eventInfo?.name || undefined,
                    created_at: ticketData.created_at,
                };
            }

            // 4. Fetch total claims count for this user
            let userTotalClaims = 0;
            if (session.user_id) {
                const { count } = await supabase
                    .from("sessions")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", session.user_id)
                    .eq("is_claimed", true);
                userTotalClaims = count || 1;
            }

            // 5. Fetch Media Count Summary (NO HEAVY IMAGES LOADED TO SAVE BANDWIDTH)
            const { data: mediaRows } = await supabase
                .from("media")
                .select("type")
                .eq("session_id", queryId);

            const mediaSummary = {
                total: mediaRows?.length || 0,
                photos: mediaRows?.filter((m) => m.type === "photo" || m.type === "image").length || 0,
                gifs: mediaRows?.filter((m) => m.type === "gif").length || 0,
                lives: mediaRows?.filter((m) => m.type === "live" || m.type === "video").length || 0,
            };

            return NextResponse.json({
                success: true,
                data: {
                    session,
                    user: userInfo,
                    userTotalClaims,
                    queueTicket,
                    mediaSummary,
                },
            });
        }

        // CASE 2: List sessions with search, filters, sorting, and pagination
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status")?.trim() || "all"; // 'all' | 'claimed' | 'unclaimed'
        const policy = searchParams.get("policy")?.trim() || "all"; // 'all' | 'legacy' | 'new'
        const sort = searchParams.get("sort")?.trim() || "newest";
        const pageParam = parseInt(searchParams.get("page") || "1", 10);
        const page = Math.max(pageParam, 1);
        const limitParam = parseInt(searchParams.get("limit") || "20", 10);
        const limit = Math.min(Math.max(limitParam, 1), 100);

        let query = supabase
            .from("sessions")
            .select("id, created_at, event_name, user_id, is_claimed, queue_ticket_id", { count: "exact" });

        // Search filter (UUID or Event Name)
        if (search) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(search)) {
                query = query.eq("id", search);
            } else {
                query = query.ilike("event_name", `%${search}%`);
            }
        }

        // Status filter
        if (status === "claimed") {
            query = query.eq("is_claimed", true);
        } else if (status === "unclaimed") {
            query = query.eq("is_claimed", false);
        }

        // Policy filter (3-day expiry policy started 2026-10-05)
        const policyStart = "2026-10-05T00:00:00.000Z";
        if (policy === "legacy") {
            query = query.lt("created_at", policyStart);
        } else if (policy === "new") {
            query = query.gte("created_at", policyStart);
        }

        // Sorting
        switch (sort) {
            case "oldest":
                query = query.order("created_at", { ascending: true });
                break;
            case "event_asc":
                query = query.order("event_name", { ascending: true }).order("created_at", { ascending: false });
                break;
            case "event_desc":
                query = query.order("event_name", { ascending: false }).order("created_at", { ascending: false });
                break;
            case "claimed_first":
                query = query.order("is_claimed", { ascending: false }).order("created_at", { ascending: false });
                break;
            case "unclaimed_first":
                query = query.order("is_claimed", { ascending: true }).order("created_at", { ascending: false });
                break;
            case "newest":
            default:
                query = query.order("created_at", { ascending: false });
                break;
        }

        // Pagination range
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // Parallel stats query
        const [queryRes, totalRes, claimedRes] = await Promise.all([
            query,
            supabase.from("sessions").select("id", { count: "exact", head: true }),
            supabase.from("sessions").select("id", { count: "exact", head: true }).eq("is_claimed", true),
        ]);

        if (queryRes.error) {
            return NextResponse.json({ success: false, error: queryRes.error.message }, { status: 500 });
        }

        const totalOverall = totalRes.count || 0;
        const claimedOverall = claimedRes.count || 0;
        const unclaimedOverall = totalOverall - claimedOverall;

        const totalFiltered = queryRes.count || 0;
        const totalPages = Math.ceil(totalFiltered / limit) || 1;

        return NextResponse.json({
            success: true,
            sessions: queryRes.data || [],
            pagination: {
                page,
                limit,
                total: totalFiltered,
                totalPages,
            },
            stats: {
                total: totalOverall,
                claimed: claimedOverall,
                unclaimed: unclaimedOverall,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}
