'use client';

import { Toolbox } from "@/components/toolbox/Toolbox";
import { PipelineCanvas } from "@/components/pipeline/PipelineCanvas";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { usePipelineStore } from "@/store/pipelineStore";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left: Toolbox (30%) */}
      <aside 
        className="flex-shrink-0 z-10 shadow-lg flex flex-col overflow-hidden border-r"
        style={{ width: '30%' }}
      >
        <Toolbox />
      </aside>

      {/* Center: Pipeline Canvas (30%) */}
      <section 
        className="flex-shrink-0 relative z-0 overflow-hidden"
        style={{ width: '30%' }}
      >
        <PipelineCanvas />
      </section>

      {/* Right: Preview Panel (40%) */}
      <aside
        className="flex-shrink-0 z-10 shadow-lg border-l"
        style={{ width: '40%' }}
      >
        <PreviewPanel />
      </aside>
    </main>
  );
}
