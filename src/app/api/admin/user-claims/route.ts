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

export interface UserClaimSummary {
    userId: string;
    displayName: string;
    email: string | null;
    phoneNumber: string | null;
    totalClaims: number;
    latestClaimAt: string;
    latestEventName: string | null;
    sessions: {
        id: string;
        event_name: string | null;
        created_at: string;
    }[];
}

/**
 * GET /api/admin/user-claims?search=<query>&sort=<count|recent>&limit=<number>
 * Lightweight endpoint to monitor and inspect how many sessions each user has claimed.
 */
export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
        const sortBy = searchParams.get("sort") === "recent" ? "recent" : "count";
        const limitParam = parseInt(searchParams.get("limit") || "100", 10);
        const limit = Math.min(Math.max(limitParam, 1), 300);

        const supabase = createServiceClient();

        // 1. Fetch all claimed sessions with minimal columns to keep memory and bandwidth tiny
        const { data: sessions, error: sessionsErr } = await supabase
            .from("sessions")
            .select("id, user_id, event_name, created_at")
            .eq("is_claimed", true)
            .not("user_id", "is", null)
            .order("created_at", { ascending: false });

        if (sessionsErr) {
            return NextResponse.json({ success: false, error: sessionsErr.message }, { status: 500 });
        }

        if (!sessions || sessions.length === 0) {
            return NextResponse.json({
                success: true,
                summary: {
                    totalUniqueUsers: 0,
                    totalClaimedSessions: 0,
                    avgClaimsPerUser: 0,
                    topClaimer: null,
                },
                users: [],
            });
        }

        // 2. Group sessions by user_id
        const userGroups = new Map<string, {
            totalClaims: number;
            latestClaimAt: string;
            latestEventName: string | null;
            sessions: { id: string; event_name: string | null; created_at: string }[];
        }>();

        for (const s of sessions) {
            const uid = s.user_id as string;
            const existing = userGroups.get(uid);
            if (existing) {
                existing.totalClaims += 1;
                existing.sessions.push({
                    id: s.id,
                    event_name: s.event_name,
                    created_at: s.created_at,
                });
            } else {
                userGroups.set(uid, {
                    totalClaims: 1,
                    latestClaimAt: s.created_at,
                    latestEventName: s.event_name || null,
                    sessions: [{
                        id: s.id,
                        event_name: s.event_name,
                        created_at: s.created_at,
                    }],
                });
            }
        }

        // 3. Fetch user contact details from queue_tickets (mapping user_id -> display_name & phone_number)
        const { data: ticketUsers } = await supabase
            .from("queue_tickets")
            .select("user_id, display_name, phone_number, created_at")
            .not("user_id", "is", null)
            .order("created_at", { ascending: false });

        const ticketMap = new Map<string, { name: string; phone: string | null }>();
        if (ticketUsers) {
            for (const t of ticketUsers) {
                if (t.user_id && !ticketMap.has(t.user_id)) {
                    ticketMap.set(t.user_id, {
                        name: t.display_name,
                        phone: t.phone_number || null,
                    });
                }
            }
        }

        // 4. Assemble aggregated user claim list
        const userList: UserClaimSummary[] = [];

        for (const [userId, stats] of userGroups.entries()) {
            const ticketInfo = ticketMap.get(userId);
            const fallbackName = ticketInfo?.name || `User #${userId.slice(0, 8)}`;
            const fallbackPhone = ticketInfo?.phone || null;

            userList.push({
                userId,
                displayName: fallbackName,
                email: ticketInfo?.name?.includes("@") ? ticketInfo.name : null,
                phoneNumber: fallbackPhone,
                totalClaims: stats.totalClaims,
                latestClaimAt: stats.latestClaimAt,
                latestEventName: stats.latestEventName,
                sessions: stats.sessions,
            });
        }

        // 5. Calculate summary metrics
        const totalUniqueUsers = userList.length;
        const totalClaimedSessions = sessions.length;
        const avgClaimsPerUser = totalUniqueUsers > 0 
            ? parseFloat((totalClaimedSessions / totalUniqueUsers).toFixed(1)) 
            : 0;

        // Sort to determine top claimer
        const sortedByClaims = [...userList].sort((a, b) => b.totalClaims - a.totalClaims);
        const topUser = sortedByClaims[0] || null;

        const summary = {
            totalUniqueUsers,
            totalClaimedSessions,
            avgClaimsPerUser,
            topClaimer: topUser ? {
                displayName: topUser.displayName,
                userId: topUser.userId,
                totalClaims: topUser.totalClaims,
            } : null,
        };

        // 6. Filter by search query if provided
        let filteredUsers = userList;
        if (searchQuery) {
            filteredUsers = userList.filter((u) => {
                const nameMatch = u.displayName.toLowerCase().includes(searchQuery);
                const idMatch = u.userId.toLowerCase().includes(searchQuery);
                const phoneMatch = u.phoneNumber ? u.phoneNumber.toLowerCase().includes(searchQuery) : false;
                const emailMatch = u.email ? u.email.toLowerCase().includes(searchQuery) : false;
                const eventMatch = u.sessions.some(s => (s.event_name || "").toLowerCase().includes(searchQuery));
                return nameMatch || idMatch || phoneMatch || emailMatch || eventMatch;
            });
        }

        // 7. Apply selected sorting
        if (sortBy === "recent") {
            filteredUsers.sort((a, b) => new Date(b.latestClaimAt).getTime() - new Date(a.latestClaimAt).getTime());
        } else {
            // Default: highest claims first, tie-breaker: most recent claim
            filteredUsers.sort((a, b) => {
                if (b.totalClaims !== a.totalClaims) {
                    return b.totalClaims - a.totalClaims;
                }
                return new Date(b.latestClaimAt).getTime() - new Date(a.latestClaimAt).getTime();
            });
        }

        return NextResponse.json({
            success: true,
            summary,
            users: filteredUsers.slice(0, limit),
            totalMatching: filteredUsers.length,
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
    }
}
