"use client";

import { useState } from "react";
import type { ZwrBoards, ZwrEntry, ZwrPlayerCount } from "@/lib/zwr";
import { PLAYER_COUNT_LABELS } from "@/lib/zwr";

const COUNTS: ZwrPlayerCount[] = [1, 2, 3, 4];

function formatPlayers(entry: ZwrEntry): string {
  return entry.players.map((p) => p.name).join(" · ");
}

export function ZombiesBoardTabs({ boards }: { boards: ZwrBoards }) {
  const defaultCount =
    COUNTS.find((c) => boards[c].length > 0) ?? (1 as ZwrPlayerCount);
  const [players, setPlayers] = useState<ZwrPlayerCount>(defaultCount);
  const rows = boards[players];

  return (
    <div className="zombies-board">
      <div className="zombies-tabs" role="tablist" aria-label="Player count">
        {COUNTS.map((count) => {
          const disabled = boards[count].length === 0;
          return (
            <button
              key={count}
              type="button"
              role="tab"
              aria-selected={players === count}
              className={`zombies-tab${players === count ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => setPlayers(count)}
            >
              {PLAYER_COUNT_LABELS[count]}
              <span className="zombies-tab-count">{boards[count].length}</span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="zombies-empty">No records for this player count.</p>
      ) : (
        <div className="zombies-table-wrap">
          <table className="zombies-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Players</th>
                <th scope="col">Round</th>
                <th scope="col">Platform</th>
                <th scope="col">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={`${players}-${entry.rank}-${formatPlayers(entry)}`}>
                  <td className="zombies-rank">{entry.rank}</td>
                  <td>
                    <span className="zombies-players">
                      {entry.players.map((p, i) => (
                        <span key={`${p.name}-${i}`}>
                          {i > 0 ? " · " : null}
                          {p.profileUrl ? (
                            <a
                              href={p.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {p.name}
                            </a>
                          ) : (
                            p.name
                          )}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="zombies-round">
                    {entry.evidenceUrl ? (
                      <a
                        href={entry.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {entry.round}
                      </a>
                    ) : (
                      entry.round
                    )}
                  </td>
                  <td className="zombies-platform">{entry.platform ?? "—"}</td>
                  <td>
                    {entry.evidenceUrl ? (
                      <a
                        className="zombies-evidence"
                        href={entry.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
