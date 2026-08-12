import type { ClassBuild } from "@/types/class";
import type { EmblemRow, LoadoutRow, Profile } from "@/types/database";
import type { Json } from "@/types/database";

export type CommunitySort = "trending" | "new" | "top";

export type CommunityTab = CommunitySort | "loadouts" | "emblems";

export interface CommunityLoadout extends LoadoutRow {
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
  remix_of_title?: string | null;
  remix_of_slug?: string | null;
  liked_by_me?: boolean;
  saved_by_me?: boolean;
}

export interface CommunityEmblem extends EmblemRow {
  profile: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
  layer_count?: number;
}

export interface PublishLoadoutInput {
  title: string;
  description?: string;
  build: ClassBuild;
  remixOf?: string | null;
}

export interface CommunityListParams {
  sort?: CommunitySort;
  q?: string;
  weapon?: string;
  page?: number;
  pageSize?: number;
}

export const COMMUNITY_PAGE_SIZE = 12;

/**
 * Trending score:
 * like_count / ((hours_since_created + 2) ^ 1.5)
 */
export function trendingScore(likeCount: number, createdAt: string): number {
  const hours =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return likeCount / Math.pow(hours + 2, 1.5);
}

export type { Json };
