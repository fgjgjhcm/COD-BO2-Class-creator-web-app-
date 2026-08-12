"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { uniqueSlug, isValidUsername, normalizeUsername } from "@/lib/community/slug";
import { parseEmblemCodeResult } from "@/lib/community/emblemCode";
import {
  parseClassBuild,
  validateClassBuild,
} from "@/lib/community/validate";
import type { ClassBuild } from "@/types/class";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function requireUser() {
  if (!isSupabaseConfigured()) {
    return { error: "Community is not configured yet." as const, user: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sign in required." as const, user: null };
  }
  return { error: null, user, supabase };
}

export async function claimUsernameAction(
  rawUsername: string,
): Promise<ActionResult<{ username: string }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const username = normalizeUsername(rawUsername);
  if (!isValidUsername(username)) {
    return {
      ok: false,
      error: "Username must be 3–20 characters: a-z, 0-9, underscore.",
    };
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ username })
    .eq("id", auth.user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That username is taken." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/community");
  return { ok: true, data: { username } };
}

export async function updateProfileAction(input: {
  displayName?: string;
  bio?: string;
}): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      display_name: input.displayName?.trim().slice(0, 40) || null,
      bio: input.bio?.trim().slice(0, 280) || null,
    })
    .eq("id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  if (profile?.username) {
    revalidatePath(`/community/user/${profile.username}`);
  }
  return { ok: true, data: undefined };
}

export async function updateAvatarAction(input: {
  avatarUrl: string | null;
}): Promise<ActionResult<{ avatarUrl: string | null }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const avatarUrl = input.avatarUrl?.trim() || null;
  if (avatarUrl) {
    const env = getSupabaseEnv();
    const prefix = env
      ? `${env.url.replace(/\/$/, "")}/storage/v1/object/public/avatars/`
      : null;
    if (!prefix || !avatarUrl.startsWith(prefix)) {
      return { ok: false, error: "Invalid avatar URL." };
    }
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { error } = await auth.supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  if (profile?.username) {
    revalidatePath(`/community/user/${profile.username}`);
  }
  return { ok: true, data: { avatarUrl } };
}

export async function toggleFollowAction(
  targetUserId: string,
): Promise<ActionResult<{ following: boolean }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  if (!targetUserId || targetUserId === auth.user.id) {
    return { ok: false, error: "You cannot follow yourself." };
  }

  const [{ data: target }, { data: existing }] = await Promise.all([
    auth.supabase
      .from("profiles")
      .select("id, username")
      .eq("id", targetUserId)
      .maybeSingle(),
    auth.supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", auth.user.id)
      .eq("following_id", targetUserId)
      .maybeSingle(),
  ]);

  if (!target) return { ok: false, error: "Operative not found." };

  const { data: me } = await auth.supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await auth.supabase
      .from("follows")
      .delete()
      .eq("follower_id", auth.user.id)
      .eq("following_id", targetUserId);
    if (error) return { ok: false, error: error.message };
    if (target.username) revalidatePath(`/community/user/${target.username}`);
    if (me?.username) revalidatePath(`/community/user/${me.username}`);
    return { ok: true, data: { following: false } };
  }

  const { error } = await auth.supabase.from("follows").insert({
    follower_id: auth.user.id,
    following_id: targetUserId,
  });
  if (error) return { ok: false, error: error.message };
  if (target.username) revalidatePath(`/community/user/${target.username}`);
  if (me?.username) revalidatePath(`/community/user/${me.username}`);
  return { ok: true, data: { following: true } };
}

export async function publishLoadoutAction(input: {
  title: string;
  description?: string;
  build: ClassBuild;
  remixOf?: string | null;
}): Promise<ActionResult<{ slug: string; id: string }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile?.username) {
    return { ok: false, error: "Choose a username before publishing." };
  }

  const title = input.title.trim().slice(0, 64);
  if (!title) return { ok: false, error: "Title is required." };

  const build = parseClassBuild(input.build);
  if (!build) return { ok: false, error: "Invalid loadout data." };

  const errors = validateClassBuild(build);
  if (errors.length) {
    return { ok: false, error: errors[0] ?? "Invalid loadout." };
  }

  const slug = uniqueSlug(title);
  const { data, error } = await auth.supabase
    .from("loadouts")
    .insert({
      user_id: auth.user.id,
      title,
      description: input.description?.trim().slice(0, 500) || null,
      slug,
      loadout_data: build as unknown as import("@/types/database").Json,
      remix_of: input.remixOf || null,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to publish." };
  }

  revalidatePath("/community");
  revalidatePath(`/community/loadout/${data.slug}`);
  return { ok: true, data: { slug: data.slug, id: data.id } };
}

export async function deleteLoadoutAction(
  loadoutId: string,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: existing } = await auth.supabase
    .from("loadouts")
    .select("id, slug, user_id")
    .eq("id", loadoutId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!existing) {
    return { ok: false, error: "Loadout not found." };
  }

  const { error } = await auth.supabase
    .from("loadouts")
    .delete()
    .eq("id", loadoutId)
    .eq("user_id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  revalidatePath(`/community/loadout/${existing.slug}`);
  return { ok: true, data: undefined };
}

export async function toggleLikeAction(
  loadoutId: string,
): Promise<ActionResult<{ liked: boolean }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: existing } = await auth.supabase
    .from("loadout_likes")
    .select("loadout_id")
    .eq("user_id", auth.user.id)
    .eq("loadout_id", loadoutId)
    .maybeSingle();

  if (existing) {
    const { error } = await auth.supabase
      .from("loadout_likes")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("loadout_id", loadoutId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/community");
    return { ok: true, data: { liked: false } };
  }

  const { error } = await auth.supabase.from("loadout_likes").insert({
    user_id: auth.user.id,
    loadout_id: loadoutId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  return { ok: true, data: { liked: true } };
}

export async function toggleSaveAction(
  loadoutId: string,
): Promise<ActionResult<{ saved: boolean }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: existing } = await auth.supabase
    .from("loadout_saves")
    .select("loadout_id")
    .eq("user_id", auth.user.id)
    .eq("loadout_id", loadoutId)
    .maybeSingle();

  if (existing) {
    const { error } = await auth.supabase
      .from("loadout_saves")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("loadout_id", loadoutId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/community");
    return { ok: true, data: { saved: false } };
  }

  const { error } = await auth.supabase.from("loadout_saves").insert({
    user_id: auth.user.id,
    loadout_id: loadoutId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  return { ok: true, data: { saved: true } };
}

export async function reportLoadoutAction(input: {
  loadoutId: string;
  reason?: string;
}): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { error } = await auth.supabase.from("reports").insert({
    reporter_id: auth.user.id,
    loadout_id: input.loadoutId,
    reason: input.reason?.trim().slice(0, 300) || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function publishEmblemAction(input: {
  title: string;
  description?: string;
  emblemCode: string;
  previewUrl?: string | null;
}): Promise<ActionResult<{ slug: string; id: string; layerCount: number }>> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("username")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile?.username) {
    return { ok: false, error: "Choose a username before publishing." };
  }

  const title = input.title.trim().slice(0, 64);
  if (!title) return { ok: false, error: "Title is required." };

  const emblemCode = input.emblemCode.trim();
  const parsedResult = parseEmblemCodeResult(emblemCode);
  if (!parsedResult.ok) {
    return { ok: false, error: parsedResult.error };
  }
  const parsed = parsedResult.data;
  if (parsed.layerCount < 1) {
    return { ok: false, error: "Emblem code has no layers." };
  }

  let previewUrl = input.previewUrl?.trim() || null;
  if (previewUrl) {
    const env = getSupabaseEnv();
    const prefix = env
      ? `${env.url.replace(/\/$/, "")}/storage/v1/object/public/emblem-previews/`
      : null;
    if (!prefix || !previewUrl.startsWith(prefix)) {
      return { ok: false, error: "Invalid preview image URL." };
    }
  }

  const slug = uniqueSlug(title);
  const { data, error } = await auth.supabase
    .from("emblems")
    .insert({
      user_id: auth.user.id,
      title,
      description: input.description?.trim().slice(0, 500) || null,
      slug,
      emblem_code: emblemCode,
      preview_url: previewUrl,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to publish emblem." };
  }

  revalidatePath("/community");
  revalidatePath("/community/emblems");
  revalidatePath(`/community/emblem/${data.slug}`);
  return {
    ok: true,
    data: { slug: data.slug, id: data.id, layerCount: parsed.layerCount },
  };
}

export async function deleteEmblemAction(
  emblemId: string,
): Promise<ActionResult> {
  const auth = await requireUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return { ok: false, error: auth.error ?? "Sign in required." };
  }

  const { data: existing } = await auth.supabase
    .from("emblems")
    .select("id, slug")
    .eq("id", emblemId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!existing) return { ok: false, error: "Emblem not found." };

  const { error } = await auth.supabase
    .from("emblems")
    .delete()
    .eq("id", emblemId)
    .eq("user_id", auth.user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/community");
  revalidatePath("/community/emblems");
  revalidatePath(`/community/emblem/${existing.slug}`);
  return { ok: true, data: undefined };
}
