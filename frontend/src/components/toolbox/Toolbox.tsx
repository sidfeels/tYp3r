'use client';

import { TRANSFORM_CATEGORIES } from "@/lib/transformRegistry";
import { usePipelineStore, TransformType } from "@/store/pipelineStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Layers, Pin, PinOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Toolbox() {
  const { addBlock, pinnedTransforms, togglePin, setDraggingTransform } = usePipelineStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all transform items from all categories into one list
  const allTransforms = useMemo(() => {
    return TRANSFORM_CATEGORIES.flatMap((cat) => cat.items);
  }, []);

  const { pinnedItems, otherItems } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let visible = allTransforms;
    
    if (query) {
      visible = allTransforms.filter((item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    const pinned: typeof allTransforms = [];
    const others: typeof allTransforms = [];

    visible.forEach(item => {
      if (pinnedTransforms.includes(item.type)) {
        pinned.push(item);
      } else {
        others.push(item);
      }
    });

    return { pinnedItems: pinned, otherItems: others };
  }, [searchQuery, allTransforms, pinnedTransforms]);

  const renderItem = (item: { type: TransformType; name: string; description: string }, isPinned: boolean) => (
    <div
      key={item.type}
      className="group relative flex items-start gap-2"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        setDraggingTransform(item.type);
      }}
      onDragEnd={() => setDraggingTransform(null)}
    >
      <Button
        variant="outline"
        className="flex-1 justify-start h-auto py-3 px-4 flex flex-col items-start gap-1 text-left"
        onClick={() => addBlock(item.type)}
      >
        <span className="font-medium text-sm">{item.name}</span>
        <span className="text-xs text-muted-foreground font-normal line-clamp-2">
          {item.description}
        </span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity ${isPinned ? 'opacity-100 text-primary' : 'text-muted-foreground'}`}
        onClick={(e) => {
          e.stopPropagation();
          togglePin(item.type);
        }}
        title={isPinned ? "Unpin" : "Pin to top"}
      >
        {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-[60px] p-4 border-b flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" /> Transforms
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {pinnedItems.length + otherItems.length}
          </span>
        </div>
      </div>
      <div className="px-4 py-3 border-b shrink-0">
        <div className="relative">
          <Input
            placeholder="Search transforms..."
            className="pl-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <div className="px-4 py-3 space-y-2">
            {pinnedItems.length === 0 && otherItems.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No transforms match your search.
              </div>
            ) : (
              <>
                {pinnedItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 px-1">
                      <Pin className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pinned
                      </span>
                    </div>
                    {pinnedItems.map((item) => renderItem(item, true))}
                    <Separator className="my-2" />
                  </div>
                )}
                
                <div className="space-y-2">
                  {otherItems.map((item) => renderItem(item, false))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
