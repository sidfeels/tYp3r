"use client";

import { useState } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface VariationItem {
  output: string;
  strategy: string;
}

export function VariationsModal() {
  const {
    inputText,
    blocks,
    variationsOpen,
    setVariationsOpen,
  } = usePipelineStore();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VariationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateVariations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiClient.fuzzText(inputText, 10);
      if (error || !data) {
        setError(error?.detail || error?.message || "Failed to generate variations");
        setResults([]);
        return;
      }
      const parsed = data.results.map((item) => ({
        output: item.output,
        strategy: item.strategy || "unknown",
      }));
      setResults(parsed);
      if (parsed.length === 0) {
        toast.info("No variations produced. Try adjusting the pipeline or input.");
      }
    } catch (err) {
      console.error("Variation generation failed", err);
      setError("Backend unavailable. Is the API running?");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const open = variationsOpen;

  return (
    <Dialog open={open} onOpenChange={setVariationsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Variations
          </DialogTitle>
          <DialogDescription>
            Generate alternative obfuscations using the current input and pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center pb-4 border-b">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Input length:</span> {inputText.length} chars | Blocks: {blocks.length}
          </div>
          <Button
            size="sm"
            onClick={generateVariations}
            disabled={loading || !inputText}
            className="gap-2"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating" : "Generate"}
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <ScrollArea className="mt-4 max-h-[420px] pr-4">
          <div className="space-y-4">
            {results.length === 0 && !loading && !error && (
              <div className="text-center text-sm text-muted-foreground">
                No variations generated yet.
              </div>
            )}
            {results.map((item, index) => (
              <div key={`${item.output}-${index}`} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {item.strategy.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleCopy(item.output)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-muted/40 rounded-md p-3">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
