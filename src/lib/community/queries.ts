import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  COMMUNITY_PAGE_SIZE,
  trendingScore,
  type CommunityEmblem,
  type CommunityListParams,
  type CommunityLoadout,
  type CommunityProfile,
} from "@/types/community";
import type { Profile } from "@/types/database";
import { parseClassBuild } from "@/lib/community/validate";
import { parseEmblemCode } from "@/lib/community/emblemCode";

type CurrentEmblemLite = {
  id: string;
  title: string;
  slug: string;
  preview_url: string | null;
};

type ProfileEmbed = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  current_emblem_id?: string | null;
  current_emblem?: CurrentEmblemLite | CurrentEmblemLite[] | null;
};

const LOADOUT_PROFILE_EMBED =
  "profiles!loadouts_user_id_fkey(id, username, display_name, avatar_url, current_emblem_id, current_emblem:emblems!profiles_current_emblem_id_fkey(id, title, slug, preview_url))";

const EMBLEM_PROFILE_EMBED =
  "profiles!emblems_user_id_fkey(id, username, display_name, avatar_url, current_emblem_id, current_emblem:emblems!profiles_current_emblem_id_fkey(id, title, slug, preview_url))";

function mapProfile(
  profileRaw: ProfileEmbed | ProfileEmbed[] | null | undefined,
): CommunityProfile | null {
  const profile = Array.isArray(profileRaw)
    ? profileRaw[0] ?? null
    : profileRaw ?? null;
  if (!profile) return null;
  const emblemRaw = profile.current_emblem;
  const current_emblem = Array.isArray(emblemRaw)
    ? emblemRaw[0] ?? null
    : emblemRaw ?? null;
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    current_emblem_id: profile.current_emblem_id ?? null,
    current_emblem,
  };
}

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
    is_public?: boolean;
    created_at: string;
    updated_at: string;
    profiles?: ProfileEmbed | ProfileEmbed[] | null;
  },
  extras?: Partial<CommunityLoadout>,
): CommunityLoadout {
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
    is_public: row.is_public ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: mapProfile(row.profiles),
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
    .select(
      "*, current_emblem:emblems!profiles_current_emblem_id_fkey(id, title, slug, preview_url)",
    )
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

  if (sort === "trending") {
    let query = supabase
      .from("loadouts")
      .select(`*, ${LOADOUT_PROFILE_EMBED}`, { count: "exact" })
      .eq("is_public", true)
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
    .select(`*, ${LOADOUT_PROFILE_EMBED}`, { count: "exact" })
    .eq("is_public", true);

  if (sort === "top") {
    query = query
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q) {
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
        .select(`*, ${LOADOUT_PROFILE_EMBED}`, { count: "exact" })
        .eq("is_public", true)
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
    .select(`*, ${LOADOUT_PROFILE_EMBED}`)
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
    .select(`*, ${LOADOUT_PROFILE_EMBED}`)
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
    .select(
      "*, current_emblem:emblems!profiles_current_emblem_id_fkey(id, title, slug, preview_url, is_public)",
    )
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data;
}

export async function listLoadoutsByUser(
  userId: string,
  opts?: { includePrivate?: boolean },
) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("loadouts")
    .select(`*, ${LOADOUT_PROFILE_EMBED}`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!opts?.includePrivate) {
    query = query.eq("is_public", true);
  }
  const { data } = await query;
  return (data ?? []).map((row) => mapRow(row as never));
}

export async function listEmblemsByUser(
  userId: string,
  opts?: { includePrivate?: boolean },
) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("emblems")
    .select(`*, ${EMBLEM_PROFILE_EMBED}`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!opts?.includePrivate) {
    query = query.eq("is_public", true);
  }
  const { data } = await query;
  return (data ?? []).map((row) => mapEmblemRow(row as never));
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
    supabase
      .from("loadouts")
      .select("like_count")
      .eq("user_id", userId)
      .eq("is_public", true),
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

function mapEmblemRow(
  row: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    slug: string;
    emblem_code: string;
    preview_url: string | null;
    remix_of: string | null;
    like_count: number;
    save_count: number;
    is_public?: boolean;
    created_at: string;
    updated_at: string;
    profiles?: ProfileEmbed | ProfileEmbed[] | null;
  },
): CommunityEmblem {
  const parsed = parseEmblemCode(row.emblem_code);
  const profile = mapProfile(row.profiles);
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    emblem_code: row.emblem_code,
    preview_url: row.preview_url,
    remix_of: row.remix_of,
    like_count: row.like_count,
    save_count: row.save_count,
    is_public: row.is_public ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile,
    layer_count: parsed?.layerCount ?? 0,
    is_current: profile?.current_emblem_id === row.id,
  };
}

export async function listCommunityEmblems(
  params: CommunityListParams = {},
): Promise<{ items: CommunityEmblem[]; total: number }> {
  if (!isSupabaseConfigured()) return { items: [], total: 0 };

  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? COMMUNITY_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sort = params.sort ?? "new";
  const q = params.q?.trim();

  let query = supabase
    .from("emblems")
    .select(`*, ${EMBLEM_PROFILE_EMBED}`, { count: "exact" })
    .eq("is_public", true);

  if (sort === "top") {
    query = query
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (q) query = query.or(`title.ilike.%${q}%`);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listCommunityEmblems", error);
    return { items: [], total: 0 };
  }

  return {
    items: (data ?? []).map((row) => mapEmblemRow(row as never)),
    total: count ?? 0,
  };
}

export async function getEmblemBySlug(
  slug: string,
): Promise<CommunityEmblem | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("emblems")
    .select(`*, ${EMBLEM_PROFILE_EMBED}`)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapEmblemRow(data as never);
}

export type { Profile };
