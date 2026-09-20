"use client";

import { useEffect, useRef, useState } from "react";
import { ASSET_CLASS_LABELS } from "@/lib/storage";
import type { AssetClass, Holding } from "@/lib/types";

export type HoldingDraft = Omit<Holding, "id">;

const CLASSES = Object.keys(ASSET_CLASS_LABELS) as AssetClass[];

/**
 * Numeric fields are held as the raw strings the user is typing. Coercing to a
 * number on every keystroke would swallow intermediate states — "0" and "0."
 * both round-trip to a blank box, which makes a quantity like 0.42 impossible
 * to type. They are parsed once, on submit.
 */
type FormState = {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: string;
  costBasis: string;
};

const EMPTY: FormState = {
  symbol: "",
  name: "",
  assetClass: "stock",
  quantity: "",
  costBasis: "",
};

function toForm(holding: Holding): FormState {
  return {
    symbol: holding.symbol,
    name: holding.name,
    assetClass: holding.assetClass,
    quantity: String(holding.quantity),
    costBasis: String(holding.costBasis),
  };
}

/**
 * Rendered only while open, and keyed by the position being edited, so each
 * appearance mounts with the right starting values. Opening the native dialog
 * is a DOM effect; the form state never has to be synced from props.
 */
export function HoldingDialog({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Holding;
  onSubmit: (draft: HoldingDraft) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<FormState>(() => (initial ? toForm(initial) : EMPTY));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const symbol = draft.symbol.trim().toUpperCase();
    const quantity = Number(draft.quantity);
    const costBasis = Number(draft.costBasis);

    if (!symbol) return setError("A ticker is required.");
    if (draft.quantity.trim() === "" || !Number.isFinite(quantity) || quantity <= 0) {
      return setError("Quantity must be greater than zero.");
    }
    if (draft.costBasis.trim() === "" || !Number.isFinite(costBasis) || costBasis < 0) {
      return setError("Average cost cannot be negative.");
    }

    onSubmit({
      symbol,
      name: draft.name.trim() || symbol,
      assetClass: draft.assetClass,
      quantity,
      costBasis,
    });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) dismisses.
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-0 text-body backdrop:bg-ink/40"
    >
      <form onSubmit={handleSubmit} className="p-7">
        <p className="eyebrow mb-2 text-faint">{initial ? "Edit position" : "New position"}</p>
        <h2 className="mb-6 text-[1.3rem] font-semibold">
          {initial ? `Update ${initial.symbol}` : "Add a holding"}
        </h2>

        <div className="space-y-4">
          <Field label="Ticker" hint="As your quote provider knows it — AAPL, VTI, BTC-USD.">
            <input
              value={draft.symbol}
              onChange={(e) => setDraft({ ...draft, symbol: e.target.value })}
              placeholder="AAPL"
              autoFocus
              className="tabular w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[0.9rem] uppercase focus-ring"
            />
          </Field>

          <Field label="Name">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Apple"
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[0.9rem] focus-ring"
            />
          </Field>

          <Field label="Asset class">
            <select
              value={draft.assetClass}
              onChange={(e) => setDraft({ ...draft, assetClass: e.target.value as AssetClass })}
              className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[0.9rem] focus-ring"
            >
              {CLASSES.map((assetClass) => (
                <option key={assetClass} value={assetClass}>
                  {ASSET_CLASS_LABELS[assetClass]}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity">
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                value={draft.quantity}
                onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                className="tabular w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[0.9rem] focus-ring"
              />
            </Field>
            <Field label="Average cost">
              <input
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                value={draft.costBasis}
                onChange={(e) => setDraft({ ...draft, costBasis: e.target.value })}
                className="tabular w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-[0.9rem] focus-ring"
              />
            </Field>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-[0.82rem] text-clay">
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg px-4 py-2.5 text-[0.85rem] text-muted transition-colors hover:text-body"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="focus-ring rounded-lg bg-ink px-4 py-2.5 text-[0.85rem] font-medium text-white transition-opacity hover:opacity-90"
          >
            {initial ? "Save changes" : "Add holding"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8rem] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[0.72rem] text-faint">{hint}</span>}
    </label>
  );
}
