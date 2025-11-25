'use client';

import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { usePipelineStore } from "@/store/pipelineStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { applyClientTransforms } from "@/lib/clientTransforms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardHistoryPanel } from "./ClipboardHistoryPanel";
import { StegoDecoderPanel } from "./StegoDecoderPanel";

export function PreviewPanel() {
  const {
    inputText,
    setInputText,
    blocks,
    addHistoryEntry,
  } = usePipelineStore();
  const [outputText, setOutputText] = useState("");
  const [inputTokens, setInputTokens] = useState<number | null>(null);
  const [outputTokens, setOutputTokens] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastToastRef = useRef<string | null>(null);

  const { result: optimisticOutput, applied: hasOptimistic } = applyClientTransforms(inputText, blocks);
  const showOptimistic = processing && hasOptimistic;
  const effectiveOutput = showOptimistic ? optimisticOutput : outputText;

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setProcessing(true);
      setError(null);

      // Process text through pipeline
      const { data: processData, error: processError } = await apiClient.processText(inputText, blocks);

      if (cancelled) return;

      if (processError) {
        const nextError = processError.detail || processError.message || "Failed to process text.";
        // Suppress scary "ValueError" prefix if it's the common empty pipeline case
        const displayError = nextError.replace(/^Value error,\s*/i, "");
        
        // Only toast if it's NOT the default empty pipeline error (which is expected initially)
        if (!displayError.includes("Pipeline must include at least one block")) {
           if (lastToastRef.current !== displayError) {
             toast.error(displayError);
             lastToastRef.current = displayError;
           }
        }
        
        setError(displayError);
        setOutputText(inputText);
        setInputTokens(null);
        setOutputTokens(null);
        setProcessing(false);
        return;
      }

      const nextOutput = processData?.result ?? "";
      setOutputText(nextOutput);

      // Count tokens for both input and output
      setLoadingTokens(true);
      const [inputTokenResult, outputTokenResult] = await Promise.all([
        apiClient.tokenizeText(inputText),
        apiClient.tokenizeText(nextOutput)
      ]);

      if (!cancelled) {
        if (inputTokenResult.data) {
          setInputTokens(inputTokenResult.data.count);
        } else {
          setInputTokens(null);
          if (inputTokenResult.error) {
            const errMsg = inputTokenResult.error.detail || inputTokenResult.error.message;
            if (errMsg && lastToastRef.current !== errMsg) {
              toast.error(errMsg);
              lastToastRef.current = errMsg;
            }
          }
        }

        if (outputTokenResult.data) {
          setOutputTokens(outputTokenResult.data.count);
        } else {
          setOutputTokens(null);
          if (outputTokenResult.error) {
            const errMsg = outputTokenResult.error.detail || outputTokenResult.error.message;
            if (errMsg && lastToastRef.current !== errMsg) {
              toast.error(errMsg);
              lastToastRef.current = errMsg;
            }
          }
        }

        setLoadingTokens(false);
        setProcessing(false);
      }
    }, 500); // Debounced to 500ms

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [inputText, blocks, hasOptimistic]);

  const copyToClipboard = async () => {
    if (!effectiveOutput) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(effectiveOutput);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = effectiveOutput;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      addHistoryEntry(inputText, effectiveOutput, blocks);
      toast.success("Copied to clipboard!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to copy";
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-900/50">
      <Tabs defaultValue="preview" className="flex-1 w-full flex flex-col overflow-hidden">
        <div className="h-[60px] p-4 border-b bg-background flex flex-wrap gap-2 justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {processing && <RefreshCw className="h-4 w-4 animate-spin" />}
              Preview
            </h2>
          </div>
          <TabsList className="grid w-auto grid-cols-3 h-8">
            <TabsTrigger value="preview" className="text-xs px-3">Live</TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-3">History</TabsTrigger>
            <TabsTrigger value="decoder" className="text-xs px-3">Stego</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto p-4 data-[state=inactive]:hidden">
          <div className="shrink-0">
            {error && (
              <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted-foreground">
                  Input Prompt
                </label>
                <div className="text-xs text-muted-foreground flex gap-3 items-center">
                  {loadingTokens && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <div title="Input tokens">
                    <span className="font-medium text-foreground">
                      {inputTokens ?? "-"}
                    </span>{" "}
                    tokens
                  </div>
                </div>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
                placeholder="Enter your prompt here..."
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2 shrink-0">
              <label className="text-sm font-medium text-muted-foreground">
                Transformed Output
              </label>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <div>{effectiveOutput.length} chars</div>
                <div title="Output tokens">
                  <span className="font-medium text-foreground">
                    {outputTokens ?? "-"}
                  </span>{" "}
                  tokens
                </div>
              </div>
            </div>
            <div className="relative flex-1 min-h-[150px]">
              <Textarea
                readOnly
                value={effectiveOutput}
                className="h-full font-mono text-sm resize-none bg-muted/30"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={copyToClipboard}
                disabled={!effectiveOutput}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 min-h-0 overflow-hidden p-4 data-[state=inactive]:hidden">
          <ClipboardHistoryPanel className="h-full border rounded-lg bg-background" />
        </TabsContent>

        <TabsContent value="decoder" className="flex-1 min-h-0 overflow-hidden p-4 data-[state=inactive]:hidden">
          <StegoDecoderPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
