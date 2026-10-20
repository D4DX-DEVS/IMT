"use client";

import { useActionState, useCallback, useState } from "react";
import { idleState, type ActionState } from "@/lib/action-state";

type SaveAction = (previous: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Local editing state for an admin form plus the wiring to submit it to a server action.
 * The form value is sent as one JSON field (`payload`), which the action validates with zod.
 * Pass `serialize` when the editing shape differs from what the action expects.
 */
export function useSaveForm<T>(initial: T, action: SaveAction, serialize: (value: T) => unknown = (v) => v) {
  const [value, setValue] = useState<T>(initial);
  const [state, formAction, pending] = useActionState(action, idleState);

  const patch = useCallback((changes: Partial<T>) => setValue((prev) => ({ ...prev, ...changes })), []);

  return { value, setValue, patch, state, formAction, pending, payload: JSON.stringify(serialize(value)) };
}

/** Array helpers used by the list editors. */
export const listOps = {
  move<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
    const target = index + delta;
    if (target < 0 || target >= list.length) return [...list];
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  },
  remove<T>(list: readonly T[], index: number): T[] {
    return list.filter((_, i) => i !== index);
  },
  replace<T>(list: readonly T[], index: number, item: T): T[] {
    return list.map((x, i) => (i === index ? item : x));
  },
};
