"use client";

import { useState } from "react";
import { setDailyTimeLimit } from "@/server/actions/user.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimeLimitFormProps {
  currentLimitMinutes: number | null;
}

export function TimeLimitForm({ currentLimitMinutes }: TimeLimitFormProps) {
  const [value, setValue] = useState(
    currentLimitMinutes !== null ? String(currentLimitMinutes) : ""
  );
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave() {
    const minutes = parseInt(value, 10);
    if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
      setMessage({ type: "error", text: "Enter a number between 1 and 1440" });
      return;
    }
    setIsPending(true);
    setMessage(null);
    const result = await setDailyTimeLimit(minutes);
    setIsPending(false);
    setMessage(
      result.success
        ? { type: "success", text: "Limit saved" }
        : { type: "error", text: result.error ?? "Something went wrong" }
    );
  }

  async function handleRemove() {
    setIsPending(true);
    setMessage(null);
    const result = await setDailyTimeLimit(null);
    setIsPending(false);
    if (result.success) {
      setValue("");
      setMessage({ type: "success", text: "Limit removed" });
    } else {
      setMessage({ type: "error", text: result.error ?? "Something went wrong" });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            id="daily-time-limit"
            label="Daily time limit (minutes)"
            type="number"
            min={1}
            max={1440}
            placeholder="e.g. 60"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={isPending || value === ""}
        >
          Save
        </Button>
      </div>

      {currentLimitMinutes !== null && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isPending}
          className="self-start"
        >
          Remove limit
        </Button>
      )}

      {message && (
        <p
          className={`text-xs ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
