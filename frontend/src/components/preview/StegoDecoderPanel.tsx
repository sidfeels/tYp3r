'use client';

import { useState } from "react";
import { toast } from "sonner";
import { Copy, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

type DecodeMethod = "auto" | "zero_width" | "emoji";

const METHOD_LABELS: Record<DecodeMethod, string> = {
  auto: "Auto detect",
  zero_width: "Zero-width",
  emoji: "Emoji variation",
};

export function StegoDecoderPanel() {
  const [text, setText] = useState("");
  const [method, setMethod] = useState<DecodeMethod>("auto");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasZeroWidthSignals = /\u200B|\u200C|\u200D|\uFEFF/.test(text);
  const hasEmojiSignals = /\p{Emoji_Presentation}/u.test(text);

  const handleDecode = async () => {
    if (!text.trim()) {
      toast.error("Paste the text you want to inspect.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiClient.decodeStego(text, method);
      if (error || !data) {
        const detail = error?.detail || error?.message || "Failed to decode text.";
        setError(detail);
        toast.error(detail);
        setResult("");
        return;
      }
      setResult(data.result);
      toast.success("Decoded hidden payload");
    } catch (decodeError) {
      const errMsg = decodeError instanceof Error ? decodeError.message : "Failed to decode";
      setError(errMsg);
      toast.error(errMsg);
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success("Copied decoded payload");
    } catch (copyError) {
      const errMsg = copyError instanceof Error ? copyError.message : "Failed to copy";
      toast.error(errMsg);
    }
  };

  const derivedHint = (() => {
    if (method !== "auto") return null;
    if (hasZeroWidthSignals) return "Zero-width characters detected";
    if (hasEmojiSignals) return "Emoji variation selectors detected";
    return "No obvious stego markers found";
  })();

  return (
    <div className="flex flex-col gap-4 h-full rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Steganography Decoder</h3>
            <p className="text-xs text-muted-foreground">
              Paste suspicious text to reveal hidden payloads.
            </p>
          </div>
          {derivedHint && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {derivedHint.includes("detected") ? (
                <ShieldAlert className="h-4 w-4 text-amber-500" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              )}
              {derivedHint}
            </div>
          )}
        </div>
        <Textarea
          placeholder="Paste zero-width or emoji stego text here..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-[140px] font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Method
        </label>
        <select
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={method}
          onChange={(event) => setMethod(event.target.value as DecodeMethod)}
        >
          {Object.entries(METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <Button
          onClick={handleDecode}
          disabled={loading || !text.trim()}
          className="gap-2"
        >
          {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          {loading ? "Decoding" : "Decode"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setText("");
            setResult("");
            setError(null);
          }}
        >
          Clear
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Decoded Output</span>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleCopy}
            disabled={!result}
          >
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
        <Textarea
          readOnly
          value={result}
          placeholder="No decoded payload yet."
          className="flex-1 font-mono text-sm bg-muted/40"
        />
      </div>
    </div>
  );
}

