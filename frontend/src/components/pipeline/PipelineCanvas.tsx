'use client';

import { usePipelineStore } from "@/store/pipelineStore";
import { PipelineBlockItem } from "./PipelineBlockItem";
import { PresetsManager } from "./PresetsManager";
import { VariationsModal } from "./VariationsModal";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

export function PipelineCanvas() {
  const {
    blocks,
    setBlocks,
    clearPipeline,
    openVariations,
    draggingTransform,
    setDraggingTransform,
    addBlock,
  } = usePipelineStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      // Ensure we don't have duplicates or invalid indices
      if (oldIndex !== -1 && newIndex !== -1) {
        setBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  }

  const handleDrop = () => {
    if (draggingTransform) {
      addBlock(draggingTransform);
      setDraggingTransform(null);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-50 dark:bg-zinc-900/50"
      onDragOver={(event) => {
        if (draggingTransform) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        if (draggingTransform) {
          event.preventDefault();
          handleDrop();
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDraggingTransform(null);
        }
      }}
    >
      <div className="h-[60px] p-4 border-b bg-background flex flex-wrap gap-2 justify-between items-center shrink-0">
        <div className="flex flex-wrap gap-2 items-center">
          <PresetsManager />
          <Button variant="outline" size="sm" onClick={clearPipeline} disabled={blocks.length === 0}>
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {blocks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
            <p className="text-center">Drag blocks here or click from the toolbox to start building your pipeline.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 pb-4">
                {blocks.map((block) => (
                  <PipelineBlockItem key={block.id} block={block} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <VariationsModal />
    </div>
  );
}
