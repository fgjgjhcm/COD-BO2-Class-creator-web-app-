import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import type { ZwrBoards, ZwrEntry, ZwrPlayer, ZwrPlayerCount } from "./types";

const EMPTY_BOARDS: ZwrBoards = { 1: [], 2: [], 3: [], 4: [] };

type CheerioEl = cheerio.Cheerio<Element>;

function parsePlatform($row: CheerioEl): string | undefined {
  const icon = $row.find(".Platform .Icon").first();
  const title = icon.attr("title")?.trim();
  if (title) return title;
  const cls = icon.attr("class") ?? "";
  const bits = cls.split(/\s+/).filter((c) => c && c !== "Icon");
  return bits.length ? bits.join(" ") : undefined;
}

function parsePlayers($: cheerio.CheerioAPI, $row: CheerioEl): ZwrPlayer[] {
  const players: ZwrPlayer[] = [];
  $row.find(".Players .Player").each((_, el) => {
    const $p = $(el);
    const name = $p.find(".Name").first().text().trim();
    if (!name) return;
    const href = $p.find("a.Label").attr("href");
    players.push({
      name,
      profileUrl: href
        ? href.startsWith("http")
          ? href
          : `https://zwr.gg${href}`
        : undefined,
    });
  });
  return players;
}

function parseBoardRows(
  $: cheerio.CheerioAPI,
  $board: CheerioEl,
  limit: number,
): ZwrEntry[] {
  const entries: ZwrEntry[] = [];
  $board.find(".Records .Row").each((_, el) => {
    if (entries.length >= limit) return false;
    const $row = $(el);
    const rankText = $row.find(".Rank").first().text().trim();
    const rank = Number.parseInt(rankText, 10);
    const roundText = $row.find(".Achieved").first().text().trim();
    const round = Number.parseInt(roundText, 10);
    if (!Number.isFinite(rank) || !Number.isFinite(round)) return;
    const players = parsePlayers($, $row);
    if (players.length === 0) return;
    const evidence =
      $row.find(".Video a[href]").attr("href") ||
      $row.find("a.Achieved[href]").attr("href");
    entries.push({
      rank,
      players,
      round,
      platform: parsePlatform($row),
      evidenceUrl: evidence || undefined,
    });
  });
  return entries;
}

/** Parse a zwr.gg BO2 high-round map page into Solo–Quad boards. */
export function parseZwrMapHtml(html: string, limitPerBoard = 40): ZwrBoards {
  const $ = cheerio.load(html);
  const boards: ZwrBoards = { ...EMPTY_BOARDS, 1: [], 2: [], 3: [], 4: [] };

  $(".Board[data-players]").each((_, el) => {
    const $board = $(el as AnyNode) as CheerioEl;
    const raw = $board.attr("data-players");
    const count = Number.parseInt(raw ?? "", 10) as ZwrPlayerCount;
    if (count !== 1 && count !== 2 && count !== 3 && count !== 4) return;
    boards[count] = parseBoardRows($, $board, limitPerBoard);
  });

  return boards;
}
