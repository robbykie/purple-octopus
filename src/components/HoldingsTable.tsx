"use client";

import { useMemo, useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
  formatSignedCurrency,
  formatTime,
} from "@/lib/format";
import { ASSET_CLASS_LABELS } from "@/lib/storage";
import type { Holding, Position } from "@/lib/types";
import { AssetAvatar } from "./AssetAvatar";
import { HoldingDialog, type HoldingDraft } from "./HoldingDialog";
import { CloudIcon, DotsIcon, PlusIcon, SearchIcon } from "./Icons";

export function HoldingsTable() {
  const { summary, addHolding, updateHolding, removeHolding, lastSyncedAt, ready, connection } =
    usePortfolio();

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Holding | undefined>();
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle
      ? summary.positions.filter(
          (position) =>
            position.symbol.toLowerCase().includes(needle) ||
            position.name.toLowerCase().includes(needle),
        )
      : summary.positions;
    return [...matches].sort((a, b) => b.value - a.value);
  }, [summary.positions, query]);

  function openAdd() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(position: Position) {
    setEditing(position);
    setMenuFor(null);
    setDialogOpen(true);
  }

  function submit(draft: HoldingDraft) {
    if (editing) updateHolding(editing.id, draft);
    else addHolding(draft);
  }

  return (
    <section className="panel min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 px-7 pt-7 pb-6">
        <div>
          <p className="eyebrow mb-2 text-faint">Your positions</p>
          <h3 className="text-[1.3rem] font-semibold">Holdings</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search holdings"
              aria-label="Search holdings"
              className="focus-ring w-[210px] rounded-lg border border-line bg-card py-2.5 pr-3 pl-9 text-[0.82rem] placeholder:text-faint"
            />
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="focus-ring flex items-center gap-2 rounded-lg bg-ink px-3.5 py-2.5 text-[0.82rem] font-medium text-white transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" />
            Add holding
          </button>
        </div>
      </div>

      {/* `relative` anchors the header's absolutely-positioned sr-only label
          inside the scroll box; without it the label escapes the panel and
          stretches the whole document on narrow screens. */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="eyebrow border-y border-line text-faint">
              <th scope="col" className="py-3.5 pr-4 pl-7 font-normal">Asset</th>
              <th scope="col" className="px-4 py-3.5 font-normal">Price</th>
              <th scope="col" className="px-4 py-3.5 font-normal">Day</th>
              <th scope="col" className="px-4 py-3.5 font-normal">Holdings</th>
              <th scope="col" className="px-4 py-3.5 font-normal">Value</th>
              <th scope="col" className="px-4 py-3.5 font-normal">Return</th>
              <th scope="col" className="py-3.5 pr-7 pl-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((position) => {
              const dayDown = position.dayChangePercent < 0;
              const returnDown = position.totalReturn < 0;

              return (
                <tr key={position.id} className="border-b border-line/60 last:border-0">
                  <td className="py-4 pr-4 pl-7">
                    <div className="flex items-center gap-3.5">
                      <AssetAvatar symbol={position.symbol} assetClass={position.assetClass} />
                      <div>
                        <p className="flex items-center gap-2">
                          <span className="tabular text-[0.92rem] font-medium">
                            {position.symbol.replace("-USD", "")}
                          </span>
                          <span className="eyebrow rounded border border-line bg-paper px-1.5 py-0.5 text-[0.52rem] text-muted">
                            {ASSET_CLASS_LABELS[position.assetClass]}
                          </span>
                          {position.stale && (
                            <span
                              className="eyebrow rounded bg-amber/15 px-1.5 py-0.5 text-[0.52rem] text-amber"
                              title="No quote — valued at cost"
                            >
                              No quote
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[0.8rem] text-faint">{position.name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="tabular px-4 py-4 text-[0.88rem]">
                    {formatCurrency(position.price)}
                  </td>

                  <td
                    className={`tabular px-4 py-4 text-[0.88rem] ${dayDown ? "text-clay" : "text-sage-deep"}`}
                  >
                    {formatPercent(position.dayChangePercent)}
                  </td>

                  <td className="px-4 py-4">
                    <p className="tabular text-[0.88rem]">{formatQuantity(position.quantity)}</p>
                    <p className="tabular mt-0.5 text-[0.75rem] text-faint">
                      at {formatCurrency(position.costBasis)}
                    </p>
                  </td>

                  <td className="tabular px-4 py-4 text-[0.88rem] font-medium">
                    {formatCurrency(position.value)}
                  </td>

                  <td className="px-4 py-4">
                    <p
                      className={`tabular text-[0.88rem] ${returnDown ? "text-clay" : "text-sage-deep"}`}
                    >
                      {formatSignedCurrency(position.totalReturn)}
                    </p>
                    <p
                      className={`tabular mt-0.5 text-[0.75rem] ${returnDown ? "text-clay/70" : "text-sage-deep/70"}`}
                    >
                      {formatPercent(position.totalReturnPercent)}
                    </p>
                  </td>

                  <td className="relative py-4 pr-7 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => setMenuFor(menuFor === position.id ? null : position.id)}
                      aria-label={`Actions for ${position.symbol}`}
                      aria-expanded={menuFor === position.id}
                      className="focus-ring rounded-md p-1.5 text-faint transition-colors hover:bg-paper hover:text-body"
                    >
                      <DotsIcon className="size-5" />
                    </button>

                    {menuFor === position.id && (
                      <div className="absolute top-full right-7 z-10 w-36 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
                        <button
                          type="button"
                          onClick={() => openEdit(position)}
                          className="block w-full px-4 py-2.5 text-left text-[0.82rem] transition-colors hover:bg-paper"
                        >
                          Edit position
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeHolding(position.id);
                            setMenuFor(null);
                          }}
                          className="block w-full px-4 py-2.5 text-left text-[0.82rem] text-clay transition-colors hover:bg-paper"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="px-7 py-14 text-center">
          <p className="text-[0.95rem] text-muted">
            {!ready
              ? "Loading your positions…"
              : query
                ? `Nothing matches “${query}”.`
                : "No positions yet."}
          </p>
          {ready && !query && (
            <button
              type="button"
              onClick={openAdd}
              className="focus-ring mt-4 rounded-lg border border-line px-4 py-2.5 text-[0.85rem] transition-colors hover:bg-paper"
            >
              Add your first holding
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-7 py-4">
        <p className="flex items-center gap-2 text-[0.76rem] text-faint">
          <CloudIcon className="size-4" />
          {connection === "demo"
            ? "Demo quotes — no live provider reached"
            : "Quotes powered by Yahoo Finance"}
        </p>
        <p className="eyebrow text-[0.58rem] text-faint">
          {lastSyncedAt ? `Last synced ${formatTime(lastSyncedAt)}` : "Not synced yet"}
        </p>
      </div>

      {dialogOpen && (
        <HoldingDialog
          key={editing?.id ?? "new"}
          initial={editing}
          onSubmit={submit}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </section>
  );
}
