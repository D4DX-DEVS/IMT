/** What a save action reports back to its form. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Per-field problems, e.g. "Hero › Eyebrow: Eyebrow is required". */
  issues?: string[];
};

export const idleState: ActionState = { status: "idle" };

/** What the login action reports back to its form. */
export type LoginState = { error?: string };
