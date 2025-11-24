"use client";

import { useMemo, useState, useRef, useCallback, useEffect, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePipelineStore, ClipboardEntry, TransformType } from "@/store/pipelineStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Star,
  StarOff,
  Clock,
  Copy,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface HistoryPanelProps {
  className?: string;
}

type FilterOption = "all" | "favorites";

function HistoryPanelBase({ className }: HistoryPanelProps) {
  const {
    clipboardHistory,
    toggleHistoryFavorite,
    removeHistoryEntry,
    clearHistory,
    setBlocks,
    setInputText,
  } = usePipelineStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [transformFilter, setTransformFilter] = useState<TransformType | "">("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  const transformOptions = useMemo(() => {
    const set = new Set<TransformType>();
    clipboardHistory.forEach((entry) => entry.blockTypes.forEach((type) => set.add(type)));
    return Array.from(set);
  }, [clipboardHistory]);

  const filteredHistory = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    let filtered = clipboardHistory;
    if (filter === "favorites") {
      filtered = filtered.filter((entry) => entry.isFavorite);
    }

    if (transformFilter) {
      filtered = filtered.filter((entry) => entry.blockTypes.includes(transformFilter));
    }

    if (!term) {
      return filtered;
    }

    return filtered.filter((entry) => {
      const searchable = `${entry.input} ${entry.output} ${entry.signature}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [clipboardHistory, debouncedSearch, filter, transformFilter]);

  const escapeRegExp = useCallback((value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), []);

  const highlightMatches = useCallback(
    (text: string) => {
      const term = debouncedSearch.trim();
      if (!term) {
        return text;
      }
      const pattern = new RegExp(`(${escapeRegExp(term)})`, "ig");
      const lowerTerm = term.toLowerCase();
      return text.split(pattern).map((part, index) => {
        if (part.toLowerCase() === lowerTerm) {
          return (
            <mark
              key={`match-${index}`}
              className="rounded-sm bg-primary/10 px-0.5 text-primary"
            >
              {part}
            </mark>
          );
        }
        return <span key={`part-${index}`}>{part}</span>;
      });
    },
    [debouncedSearch, escapeRegExp]
  );

  const handleCopy = async (entry: ClipboardEntry) => {
    try {
      await navigator.clipboard.writeText(entry.output);
      toast.success("Copied to clipboard");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to copy";
      toast.error(errMsg);
    }
  };

  const handleReapply = (entry: ClipboardEntry) => {
    setInputText(entry.input);
    setBlocks(entry.blocks.map((block) => ({ ...block, id: crypto.randomUUID() })));
    toast.success("Pipeline reapplied");
  };

  const handleDelete = (id: string) => {
    removeHistoryEntry(id);
    toast.info("Entry removed");
  };

  const handleClear = () => {
    clearHistory();
    toast.info("History cleared");
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <div className="text-sm text-center">
        No history yet. Run a transformation to see it appear here.
      </div>
    </div>
  );

  const parentRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredHistory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 6,
  });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex flex-wrap gap-2 items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-left">
          <Clock className="h-4 w-4" /> History
          <Badge variant="outline" className="text-xs">
            {clipboardHistory.length}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "favorites" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setFilter("favorites")}
          >
            Favorites
          </Button>
          <select
            className="h-8 rounded-md border bg-background px-2 text-xs"
            value={transformFilter}
            onChange={(event) => setTransformFilter(event.target.value as TransformType | "")}
          >
            <option value="">All transforms</option>
            {transformOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive"
            onClick={handleClear}
            disabled={clipboardHistory.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            className="pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {filteredHistory.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="h-full" ref={parentRef} style={{ overflow: "auto" }}>
            <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const entry = filteredHistory[virtualItem.index];
                return (
                  <div
                    key={entry.id}
                    className="absolute left-0 right-0 px-3 py-2"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="flex items-center justify-between px-3 py-2 border-b">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                            {entry.blockTypes.length} blocks
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleHistoryFavorite(entry.id)}
                          >
                            {entry.isFavorite ? (
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="px-3 py-2 space-y-2 text-xs">
                        <div className="space-y-1">
                          <div className="font-medium uppercase text-muted-foreground">Input</div>
                          <div className="truncate text-sm font-mono text-muted-foreground/90">
                            {highlightMatches(entry.input || "(empty)")}
                          </div>
                          <div className="text-[11px] text-muted-foreground/80">
                            {highlightMatches(entry.signature)}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <div className="font-medium uppercase text-muted-foreground flex items-center justify-between">
                            <span>Output</span>
                            <span className="text-[10px] uppercase tracking-wide">
                              {entry.output.length} chars
                            </span>
                          </div>
                          <div className="line-clamp-3 text-sm font-mono">
                            {highlightMatches(entry.output || "(empty)")}
                          </div>
                        </div>
                      </div>

                      <div className="px-3 py-2 border-t flex justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleReapply(entry)}
                        >
                          <RefreshCw className="h-3 w-3" /> Re-apply Pipeline
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleCopy(entry)}
                        >
                          <Copy className="h-3 w-3" /> Copy Output
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ClipboardHistoryPanel = memo(HistoryPanelBase);
