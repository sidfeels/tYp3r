# tYp3r v2 Frontend

Next.js 14 frontend for the tYp3r v2 prompt obfuscation toolkit.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 19, Tailwind CSS, Shadcn/UI
- **State**: Zustand with localStorage persistence
- **Drag & Drop**: @dnd-kit
- **Virtual Scrolling**: @tanstack/react-virtual
- **HTTP Client**: Axios
- **Tokenization**: Backend API (tiktoken)

## Prerequisites

- Node.js 18+ (or 20+ recommended)
- npm or pnpm
- Backend running on http://localhost:8000

## Installation

```bash
cd frontend

# Install dependencies
npm install

# Or using pnpm
pnpm install
```

## Environment Variables

Create `.env.local` if you need to customize the API URL:

```bash
# Default: http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running Development Server

```bash
npm run dev

# Or specify port
npm run dev -- -p 3001
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with Sonner toasts
│   │   ├── page.tsx        # Main page (3-panel layout)
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── toolbox/
│   │   │   └── Toolbox.tsx           # Transform catalog sidebar
│   │   ├── pipeline/
│   │   │   ├── PipelineCanvas.tsx    # Main pipeline builder
│   │   │   ├── PipelineBlockItem.tsx # Individual block with params
│   │   │   ├── PresetsManager.tsx    # Save/load presets
│   │   │   └── VariationsModal.tsx   # Fuzzer UI
│   │   ├── preview/
│   │   │   ├── PreviewPanel.tsx           # Input/output + metrics
│   │   │   └── ClipboardHistoryPanel.tsx  # History with search
│   │   └── ui/              # Shadcn components
│   ├── lib/
│   │   ├── api.ts                  # Backend API client
│   │   ├── config.ts               # API base URL
│   │   ├── transformRegistry.ts    # Transform metadata
│   │   ├── clientTransforms.ts     # Browser-side optimistic transforms
│   │   └── utils.ts                # cn() utility
│   └── store/
│       └── pipelineStore.ts  # Zustand store with persistence
└── public/                   # Static assets
```

## Key Features

### Pipeline Builder
- Drag blocks from toolbox to canvas
- Reorder blocks via drag-and-drop
- Toggle blocks on/off without deleting
- Adjust transform parameters (intensity, shift, etc.)
- Live preview with 500ms debounce

### Smart History
- Stores last 50 transformations
- Search by input/output/pipeline signature
- Favorite important entries
- Filter by transform type
- Re-apply entire pipeline from history
- Virtual scrolling for performance

### Collapsible Panels
- Toolbox can collapse to maximize canvas space
- Preview panel can collapse when not needed
- History panel toggles open/closed

### Auto-Copy
- Toggle to automatically copy results to clipboard
- Manual copy button always available

### Token Analytics
- Shows input/output token counts (via tiktoken)
- Character count and delta
- Helps understand obfuscation impact

### Browser Persistence
- All state (pipeline, presets, history) saved to localStorage
- Session ID tracks individual users (no login required)
- Schema versioning for safe migrations
- Multiple users on same server don't interfere

## State Management

The app uses Zustand with persistence middleware:

```typescript
// Store key in localStorage
"typ3r-storage"

// Persisted state
{
  blocks: [],           // Current pipeline
  inputText: "",        // Input textarea
  savedPresets: [],     // User-saved pipelines
  clipboardHistory: [], // Last 50 results
  autoCopyEnabled: false,
  toolboxCollapsed: false,
  previewCollapsed: false,
  historyPanelCollapsed: true,
  sessionId: "uuid",
  variationsOpen: false
}
```

To reset state, clear localStorage in DevTools or run:
```javascript
localStorage.removeItem('typ3r-storage')
```

## Transform Registry

Frontend transform metadata lives in `src/lib/transformRegistry.ts`. Each transform must match a backend-registered type:

```typescript
{
  type: "leetspeak",
  name: "Leetspeak",
  description: "Replace chars with lookalikes"
}
```

**Important**: Frontend types must match backend `engine.registry` keys exactly.

## API Client

The API wrapper (`src/lib/api.ts`) provides:

```typescript
apiClient.processText(text, blocks)
apiClient.tokenizeText(text, model)
apiClient.fuzzText(text, count, strategies)
apiClient.getTransforms()
apiClient.healthCheck()
```

All methods return `{ data, error }` for easy error handling.

## Client-Side Transforms

For instant feedback, simple transforms run in the browser before backend confirmation:

- `reverse`
- `base64`
- `rot13`
- `url_encode`
- `html_entities`

These provide optimistic UI updates while awaiting backend response.

## Troubleshooting

**Backend unavailable**: Check that backend is running on port 8000 and CORS is configured.

**State not persisting**: Check browser's localStorage isn't disabled or full.

**Drag-and-drop not working**: Ensure `@dnd-kit` packages are installed.

**Slow performance with long text**: Debounce is 500ms; consider increasing if needed in `PreviewPanel.tsx`.

**History panel laggy**: Virtual scrolling should handle 1000+ items; check browser DevTools performance.

## Development Tips

### Adding a New Transform

1. **Add to frontend type** (`src/store/pipelineStore.ts`)
   ```typescript
   export type TransformType = 
     | 'existing_transforms'
     | 'my_new_transform';
   ```

2. **Register in catalog** (`src/lib/transformRegistry.ts`)
   ```typescript
   {
     type: "my_new_transform",
     name: "My Transform",
     description: "Does something cool"
   }
   ```

3. **Add default params** (if needed) in `pipelineStore.ts`
   ```typescript
   const DEFAULT_PARAMS = {
     my_new_transform: { strength: 0.5 }
   }
   ```

4. **Add param controls** in `PipelineBlockItem.tsx` (if needed)

5. **Ensure backend registered** the same transform type

### Debugging State

```javascript
// In browser console
JSON.parse(localStorage.getItem('typ3r-storage'))
```

### Hot Reload Issues

If changes don't appear:
```bash
rm -rf .next
npm run dev
```

## Keyboard Shortcuts

(None implemented yet - reserved for future enhancement)

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

Requires:
- ES2020 support
- Async clipboard API (`navigator.clipboard`)
- localStorage

## Performance Targets

- Initial page load: <2s
- Pipeline execution: <200ms (simple), <1s (complex)
- History search: <100ms
- State persistence: <50ms

## License

Same as parent project.
