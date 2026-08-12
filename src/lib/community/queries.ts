import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  COMMUNITY_PAGE_SIZE,
  trendingScore,
  type CommunityListParams,
  type CommunityLoadout,
} from "@/types/community";
import type { Profile } from "@/types/database";
import { parseClassBuild } from "@/lib/community/validate";

type ProfileLite = Pick<
  Profile,
  "id" | "username" | "display_name" | "avatar_url"
>;

function mapRow(
  row: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    slug: string;
    loadout_data: unknown;
    remix_of: string | null;
    like_count: number;
    save_count: number;
    created_at: string;
    updated_at: string;
    profiles?: ProfileLite | ProfileLite[] | null;
  },
  extras?: Partial<CommunityLoadout>,
): CommunityLoadout {
  const profileRaw = row.profiles;
  const profile = Array.isArray(profileRaw)
    ? profileRaw[0] ?? null
    : profileRaw ?? null;

  const build = parseClassBuild(row.loadout_data);
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    loadout_data: build ?? (row.loadout_data as CommunityLoadout["loadout_data"]),
    remix_of: row.remix_of,
    like_count: row.like_count,
    save_count: row.save_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile,
    ...extras,
  };
}

export async function getSessionUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMyProfile() {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}

export async function listCommunityLoadouts(
  params: CommunityListParams = {},
): Promise<{ items: CommunityLoadout[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { items: [], total: 0 };
  }

  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? COMMUNITY_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sort = params.sort ?? "new";
  const q = params.q?.trim();

  // Trending: fetch a window and sort in memory (simple v1 formula).
  if (sort === "trending") {
    let query = supabase
      .from("loadouts")
      .select(
        "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(120);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (params.weapon) {
      query = query.eq("loadout_data->>primaryWeaponId", params.weapon);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("listCommunityLoadouts trending", error);
      return { items: [], total: 0 };
    }

    const ranked = (data ?? [])
      .map((row) => mapRow(row as never))
      .sort(
        (a, b) =>
          trendingScore(b.like_count, b.created_at) -
          trendingScore(a.like_count, a.created_at),
      );

    return {
      items: ranked.slice(from, to + 1),
      total: count ?? ranked.length,
    };
  }

  let query = supabase
    .from("loadouts")
    .select(
      "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
      { count: "exact" },
    );

  if (sort === "top") {
    query = query
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q) {
    // Title search; username filter via nested profile is limited — also try exact username match.
    query = query.or(`title.ilike.%${q}%`);
  }
  if (params.weapon) {
    query = query.eq("loadout_data->>primaryWeaponId", params.weapon);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listCommunityLoadouts", error);
    return { items: [], total: 0 };
  }

  let items = (data ?? []).map((row) => mapRow(row as never));

  // Optional username search pass when q looks like a handle.
  if (q && items.length === 0) {
    const { data: byUser } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", q)
      .limit(5);
    const ids = (byUser ?? []).map((p) => p.id);
    if (ids.length) {
      let userQuery = supabase
        .from("loadouts")
        .select(
          "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
          { count: "exact" },
        )
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (params.weapon) {
        userQuery = userQuery.eq(
          "loadout_data->>primaryWeaponId",
          params.weapon,
        );
      }
      const res = await userQuery;
      items = (res.data ?? []).map((row) => mapRow(row as never));
      return { items, total: res.count ?? items.length };
    }
  }

  return { items, total: count ?? items.length };
}

export async function getLoadoutBySlug(
  slug: string,
): Promise<CommunityLoadout | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loadouts")
    .select(
      "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const mapped = mapRow(data as never);

  if (mapped.remix_of) {
    const { data: original } = await supabase
      .from("loadouts")
      .select("title, slug")
      .eq("id", mapped.remix_of)
      .maybeSingle();
    if (original) {
      mapped.remix_of_title = original.title;
      mapped.remix_of_slug = original.slug;
    }
  }

  const user = await getSessionUser();
  if (user) {
    const [{ data: like }, { data: save }] = await Promise.all([
      supabase
        .from("loadout_likes")
        .select("loadout_id")
        .eq("user_id", user.id)
        .eq("loadout_id", mapped.id)
        .maybeSingle(),
      supabase
        .from("loadout_saves")
        .select("loadout_id")
        .eq("user_id", user.id)
        .eq("loadout_id", mapped.id)
        .maybeSingle(),
    ]);
    mapped.liked_by_me = Boolean(like);
    mapped.saved_by_me = Boolean(save);
  }

  return mapped;
}

export async function getLoadoutById(
  id: string,
): Promise<CommunityLoadout | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loadouts")
    .select(
      "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as never);
}

export async function getProfileByUsername(username: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data;
}

export async function listLoadoutsByUser(userId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("loadouts")
    .select(
      "*, profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapRow(row as never));
}

export async function getProfileStats(userId: string) {
  if (!isSupabaseConfigured()) {
    return {
      loadoutCount: 0,
      totalLikes: 0,
      followerCount: 0,
      followingCount: 0,
    };
  }
  const supabase = await createClient();
  const [{ data }, followers, following] = await Promise.all([
    supabase.from("loadouts").select("like_count").eq("user_id", userId),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  const rows = data ?? [];
  return {
    loadoutCount: rows.length,
    totalLikes: rows.reduce((sum, row) => sum + (row.like_count ?? 0), 0),
    followerCount: followers.count ?? 0,
    followingCount: following.count ?? 0,
  };
}

export async function isFollowingUser(targetUserId: string) {
  const user = await getSessionUser();
  if (!user || !isSupabaseConfigured()) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();
  return Boolean(data);
}
