'use client';

import { usePipelineStore } from "@/store/pipelineStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, FolderOpen, Trash2 } from "lucide-react";
import { useState } from "react";

export function PresetsManager() {
  const { savedPresets, savePreset, loadPreset, deletePreset, blocks } = usePipelineStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");

  const handleSave = () => {
    if (presetName) {
      savePreset(presetName, presetDesc);
      setSaveDialogOpen(false);
      setPresetName("");
      setPresetDesc("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={blocks.length === 0}>
            <Save className="h-4 w-4 mr-2" /> Save Preset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Pipeline Preset</DialogTitle>
            <DialogDescription>
              Save your current configuration to reuse later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={presetName} 
                onChange={(e) => setPresetName(e.target.value)} 
                className="col-span-3" 
                placeholder="My Custom Bypass"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="desc" className="text-right">Description</Label>
              <Input 
                id="desc" 
                value={presetDesc} 
                onChange={(e) => setPresetDesc(e.target.value)} 
                className="col-span-3" 
                placeholder="Short description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" /> Load Preset
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Preset</DialogTitle>
            <DialogDescription>
              Choose a saved configuration to load.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {savedPresets.length === 0 ? (
              <p className="text-center text-muted-foreground">No presets saved.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPresets.map((preset) => (
                  <Card key={preset.id} className="p-4 flex flex-col justify-between gap-4 hover:border-primary/50 transition-colors">
                    <div>
                      <h4 className="font-semibold">{preset.name}</h4>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.blocks.slice(0, 3).map((b, i) => (
                          <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                            {b.name}
                          </span>
                        ))}
                        {preset.blocks.length > 3 && <span className="text-xs text-muted-foreground">+{preset.blocks.length - 3} more</span>}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(preset.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => loadPreset(preset.id)}>Load</Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
