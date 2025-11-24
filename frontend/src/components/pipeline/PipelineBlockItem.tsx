'use client';

import { usePipelineStore, PipelineBlock } from "@/store/pipelineStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const UNICODE_OPTIONS = [
  { value: "zwsp", label: "Zero Width Space (U+200B)" },
  { value: "zwnj", label: "Zero Width Non-Joiner (U+200C)" },
  { value: "zwj", label: "Zero Width Joiner (U+200D)" },
  { value: "shy", label: "Soft Hyphen (U+00AD)" },
  { value: "rtl", label: "Right-to-Left Mark (U+200F)" },
  { value: "ltr", label: "Left-to-Right Mark (U+200E)" },
  { value: "wj", label: "Word Joiner (U+2060)" },
];

const ASCII_ART_FONTS = [
  "standard",
  "slant",
  "small",
  "banner3-D",
  "doom",
  "digital",
];

export function PipelineBlockItem({ block }: { block: PipelineBlock }) {
  const { removeBlock, toggleBlock, updateBlockParams } = usePipelineStore();
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderParams = () => {
    const params = [];
    
    if (block.type === 'character_injection') {
      // Special handling for character injection which has modes
      const mode = (block.params.mode as string) || 'random';
      
      params.push(
        <div key="mode" className="space-y-3">
          <Label className="text-xs font-medium">Injection Mode</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`mode-random-${block.id}`}
                name={`mode-${block.id}`}
                value="random"
                checked={mode === 'random'}
                onChange={() => updateBlockParams(block.id, { mode: 'random' })}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={`mode-random-${block.id}`} className="text-sm">Random Symbols</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`mode-specific-${block.id}`}
                name={`mode-${block.id}`}
                value="specific"
                checked={mode === 'specific'}
                onChange={() => updateBlockParams(block.id, { mode: 'specific' })}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={`mode-specific-${block.id}`} className="text-sm">Specific Characters</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`mode-unicode-${block.id}`}
                name={`mode-${block.id}`}
                value="unicode"
                checked={mode === 'unicode'}
                onChange={() => updateBlockParams(block.id, { mode: 'unicode' })}
                className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label htmlFor={`mode-unicode-${block.id}`} className="text-sm">Unicode Preset</label>
            </div>
          </div>
        </div>
      );

      if (mode === 'specific') {
        params.push(
          <div key="specific_chars" className="space-y-2">
            <Label className="text-xs font-medium">Characters to Inject</Label>
            <Input
              value={(block.params.specific_chars as string) ?? ""}
              onChange={(e) => updateBlockParams(block.id, { specific_chars: e.target.value })}
              placeholder="#@!%  (use commas or new lines to add multiple tokens)"
            />
            <p className="text-[11px] text-muted-foreground">
              Paste the exact string you want to insert. Separate multiple tokens with commas or new lines.
            </p>
          </div>
        );
      }

      if (mode === 'unicode') {
        params.push(
          <div key="unicode_target" className="space-y-2">
            <Label className="text-xs font-medium">Select Character</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={(block.params.unicode_target as string) ?? "zwsp"}
              onChange={(e) => updateBlockParams(block.id, { unicode_target: e.target.value })}
            >
              {UNICODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      }
    }

    if (block.type === 'ascii_art') {
      params.push(
        <div key="ascii_font" className="space-y-2">
          <Label className="text-xs font-medium">Font</Label>
          <select
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            value={(block.params.font as string) ?? "standard"}
            onChange={(e) => updateBlockParams(block.id, { font: e.target.value })}
          >
            {ASCII_ART_FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if ('intensity' in block.params) {
      params.push(
        <div key="intensity" className="space-y-2">
          <label className="text-xs font-medium">Intensity: {String(block.params.intensity)}</label>
          <Slider
            value={[block.params.intensity as number]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([val]) => updateBlockParams(block.id, { intensity: val })}
          />
        </div>
      );
    }

    if ('frequency' in block.params) {
      const isCharInjection = block.type === 'character_injection';
      params.push(
        <div key="frequency" className="space-y-2">
          <label className="text-xs font-medium">
            {isCharInjection ? 'Frequency / Density' : 'Frequency'}: {String(block.params.frequency)}
          </label>
          <Slider
            value={[block.params.frequency as number]}
            min={0}
            max={1}
            step={isCharInjection ? 0.05 : 0.1}
            onValueChange={([val]) => updateBlockParams(block.id, { frequency: val })}
          />
          {isCharInjection && (
            <p className="text-[11px] text-muted-foreground">
              0 = inject after every character. 1 = never inject.
            </p>
          )}
        </div>
      );
    }

    if ('shift' in block.params) {
      params.push(
        <div key="shift" className="space-y-2">
          <label className="text-xs font-medium">Shift: {String(block.params.shift)}</label>
          <Slider
            value={[block.params.shift as number]}
            min={1}
            max={25}
            step={1}
            onValueChange={([val]) => updateBlockParams(block.id, { shift: val })}
          />
        </div>
      );
    }

    if ('rails' in block.params) {
      params.push(
        <div key="rails" className="space-y-2">
          <label className="text-xs font-medium">Rails: {String(block.params.rails)}</label>
          <Slider
            value={[block.params.rails as number]}
            min={2}
            max={10}
            step={1}
            onValueChange={([val]) => updateBlockParams(block.id, { rails: val })}
          />
        </div>
      );
    }

    if ('width' in block.params) {
      params.push(
        <div key="width" className="space-y-2">
          <label className="text-xs font-medium">Width: {String(block.params.width)}</label>
          <Slider
            value={[block.params.width as number]}
            min={20}
            max={200}
            step={5}
            onValueChange={([val]) => updateBlockParams(block.id, { width: val })}
          />
        </div>
      );
    }

    if ('cover_text' in block.params) {
      params.push(
        <div key="cover_text" className="space-y-2">
          <Label className="text-xs font-medium">Cover Text</Label>
          <Textarea
            value={(block.params.cover_text as string) ?? ""}
            onChange={(event) => updateBlockParams(block.id, { cover_text: event.target.value })}
            className="min-h-[80px]"
          />
        </div>
      );
    }

    if ('cover_emoji' in block.params) {
      params.push(
        <div key="cover_emoji" className="space-y-2">
          <Label className="text-xs font-medium">Cover Emoji</Label>
          <Input
            value={(block.params.cover_emoji as string) ?? ""}
            onChange={(event) => updateBlockParams(block.id, { cover_emoji: event.target.value })}
            maxLength={4}
          />
        </div>
      );
    }

    if ('hidden_text' in block.params) {
      params.push(
        <div key="hidden_text" className="space-y-2">
          <Label className="text-xs font-medium">Hidden Payload</Label>
          <Textarea
            value={(block.params.hidden_text as string) ?? ""}
            onChange={(event) => updateBlockParams(block.id, { hidden_text: event.target.value })}
            className="min-h-[120px]"
          />
        </div>
      );
    }

    return params;
  };

  return (
    <Card ref={setNodeRef} style={style} className={`p-3 ${!block.isEnabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-accent rounded p-1 outline-none">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 font-medium text-sm">
          {block.name}
        </div>

        <Switch
          checked={block.isEnabled}
          onCheckedChange={() => toggleBlock(block.id)}
        />

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:text-destructive"
          onClick={() => removeBlock(block.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {expanded && Object.keys(block.params).length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-4 px-1">
          {renderParams()}
        </div>
      )}
    </Card>
  );
}
