"use client";

import { useState, useTransition } from "react";
import { Loader2, PlugZap } from "lucide-react";
import { testStorage } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import { Button, Notice } from "@/components/admin/ui";

/** Button that checks the storage connection and reports the result in plain words. */
export function StorageCheck() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState | null>(null);

  return (
    <div className="space-y-3">
      <Button
        disabled={pending}
        onClick={() => startTransition(async () => setResult(await testStorage()))}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
        {pending ? "Checking…" : "Test storage connection"}
      </Button>
      {result && <Notice tone={result.status === "success" ? "success" : "error"}>{result.message}</Notice>}
    </div>
  );
}
