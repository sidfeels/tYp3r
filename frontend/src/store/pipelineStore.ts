import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type TransformType =
  | 'leetspeak'
  | 'base64' | 'base32' | 'ascii85' | 'hex' | 'binary' | 'url_encode' | 'html_entities'
  | 'rot13' | 'rot47' | 'caesar' | 'morse' | 'rail_fence'
  | 'reverse' | 'upside_down' | 'mirror' | 'random_case' | 'fullwidth' | 'bubble' | 'small_caps' | 'vaporwave' | 'zalgo' | 'invisible'
  | 'ascii_art'
  | 'medieval' | 'cursive' | 'double_struck'
  | 'insert_whitespace' | 'character_injection'
  | 'pig_latin'
  | 'stego_zero_width'
  | 'stego_emoji';

export interface PipelineBlock {
  id: string;
  type: TransformType;
  name: string;
  params: Record<string, unknown>;
  isEnabled: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  blocks: PipelineBlock[];
}

export interface ClipboardEntry {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  blocks: PipelineBlock[];
  blockTypes: TransformType[];
  signature: string;
  isFavorite: boolean;
}

interface PipelineState {
  blocks: PipelineBlock[];
  inputText: string;
  outputText: string;
  savedPresets: Preset[];
  clipboardHistory: ClipboardEntry[];
  pinnedTransforms: TransformType[];
  variationsOpen: boolean;
  sessionId: string;
  draggingTransform: TransformType | null;

  addBlock: (type: TransformType) => void;
  removeBlock: (id: string) => void;
  updateBlockParams: (id: string, params: Record<string, unknown>) => void;
  toggleBlock: (id: string) => void;
  setBlocks: (blocks: PipelineBlock[]) => void;
  setInputText: (text: string) => void;
  setOutputText: (text: string) => void;
  clearPipeline: () => void;
  addHistoryEntry: (input: string, output: string, blocks: PipelineBlock[]) => void;
  toggleHistoryFavorite: (id: string) => void;
  removeHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  openVariations: () => void;
  setVariationsOpen: (value: boolean) => void;
  togglePin: (type: TransformType) => void;
  setDraggingTransform: (type: TransformType | null) => void;

  savePreset: (name: string, description: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const CURRENT_VERSION = 4;

const MAX_HISTORY = 50;

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'preset-classic-bypass',
    name: 'Classic Filter Bypass',
    description: 'Leetspeak + Whitespace injection to confuse semantic filters.',
    blocks: [
      { id: '1', type: 'leetspeak', name: 'Leetspeak', params: { intensity: 0.6 }, isEnabled: true },
      { id: '2', type: 'insert_whitespace', name: 'Insert Whitespace', params: { frequency: 0.3 }, isEnabled: true }
    ]
  },
  {
    id: 'preset-encoder',
    name: 'Multi-Layer Encoding',
    description: 'Base64 -> Hex -> Reverse. Good for payload delivery.',
    blocks: [
      { id: '1', type: 'base64', name: 'Base64', params: {}, isEnabled: true },
      { id: '2', type: 'hex', name: 'Hexadecimal', params: {}, isEnabled: true },
      { id: '3', type: 'reverse', name: 'Reverse', params: {}, isEnabled: true }
    ]
  },
  {
    id: 'preset-chaos',
    name: 'Visual Chaos',
    description: 'Zalgo + Upside Down + Random Case. Hard for humans and OCR.',
    blocks: [
      { id: '1', type: 'random_case', name: 'Random Case', params: { intensity: 0.5 }, isEnabled: true },
      { id: '2', type: 'zalgo', name: 'Zalgo', params: { intensity: 0.4 }, isEnabled: true },
      { id: '3', type: 'upside_down', name: 'Upside Down', params: {}, isEnabled: true }
    ]
  }
];

const BLOCK_NAME_MAP: Record<TransformType, string> = {
  leetspeak: 'Leetspeak',
  base64: 'Base64',
  base32: 'Base32',
  ascii85: 'ASCII85',
  hex: 'Hexadecimal',
  binary: 'Binary',
  url_encode: 'URL Encode',
  html_entities: 'HTML Entities',
  rot13: 'ROT13',
  rot47: 'ROT47',
  caesar: 'Caesar Cipher',
  morse: 'Morse Code',
  rail_fence: 'Rail Fence',
  reverse: 'Reverse',
  upside_down: 'Upside Down',
  mirror: 'Mirror',
  random_case: 'Random Case',
  fullwidth: 'Full Width',
  bubble: 'Bubble Text',
  small_caps: 'Small Caps',
  vaporwave: 'Vaporwave',
  zalgo: 'Zalgo',
  invisible: 'Invisible Text',
  ascii_art: 'ASCII Art',
  medieval: 'Medieval',
  cursive: 'Cursive',
  double_struck: 'Double Struck',
  insert_whitespace: 'Insert Whitespace',
  character_injection: 'Character Injection',
  pig_latin: 'Pig Latin',
  stego_zero_width: 'Zero-Width Stego',
  stego_emoji: 'Emoji Stego',
};

const CHARACTER_INJECTION_DEFAULT = {
  frequency: 0,
  mode: 'random',
  specific_chars: '#@!%',
  unicode_target: 'zwsp',
} as const;

const DEFAULT_PARAMS: Partial<Record<TransformType, Record<string, unknown>>> = {
  leetspeak: { intensity: 0.5 },
  caesar: { shift: 1 },
  rail_fence: { rails: 3 },
  zalgo: { intensity: 0.5 },
  insert_whitespace: { frequency: 0.2 },
  character_injection: { ...CHARACTER_INJECTION_DEFAULT },
  ascii_art: { font: 'standard', width: 80 },
  random_case: { intensity: 0.5 },
  stego_zero_width: { hidden_text: '', cover_text: 'This is a normal sentence.' },
  stego_emoji: { hidden_text: '', cover_emoji: '🐍' },
};

const cloneBlock = (block: PipelineBlock): PipelineBlock => ({
  ...block,
  params: { ...block.params },
});

const computeSignature = (blocks: PipelineBlock[]): string => {
  if (!blocks.length) {
    return 'Empty pipeline';
  }
  return blocks
    .map((block) => block.name || BLOCK_NAME_MAP[block.type] || block.type)
    .join(' → ');
};

const normalizeClipboardEntry = (entry: Partial<ClipboardEntry>): ClipboardEntry => {
  const blocks = (entry.blocks ?? []).map(cloneBlock);
  const blockTypes = entry.blockTypes ?? blocks.map((b) => b.type);
  const signature = entry.signature ?? computeSignature(blocks);
  return {
    id: entry.id ?? uuidv4(),
    timestamp: entry.timestamp ?? Date.now(),
    input: entry.input ?? '',
    output: entry.output ?? '',
    blocks,
    blockTypes,
    signature,
    isFavorite: entry.isFavorite ?? false,
  };
};

type PersistedState = Partial<PipelineState> & {
  clipboardHistory?: Partial<ClipboardEntry>[];
  blocks?: Partial<PipelineBlock>[];
  pinnedTransforms?: TransformType[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const migratePersistedState = (persisted: unknown): PipelineState => {
  const source: PersistedState = isRecord(persisted) ? (persisted as PersistedState) : {};
  const migrated: Partial<PipelineState> = { ...source };

  if (!migrated.sessionId) {
    migrated.sessionId = uuidv4();
  }

  if ('activeMode' in (migrated as Record<string, unknown>)) {
    delete (migrated as Record<string, unknown>).activeMode;
  }

  if (Array.isArray(source.clipboardHistory)) {
    migrated.clipboardHistory = source.clipboardHistory.map((entry) => normalizeClipboardEntry(entry ?? {}));
  }

  // Helper to migrate insert_symbols to character_injection
  const migrateBlock = (block: Partial<PipelineBlock>): PipelineBlock => {
    let type = block?.type as TransformType | 'insert_symbols';
    let params = { ...(block?.params ?? {}) };
    let name = block?.name;

    if (type === 'insert_symbols') {
      type = 'character_injection';
      name = 'Character Injection';
      params = {
        ...CHARACTER_INJECTION_DEFAULT,
        frequency: typeof params.frequency === 'number' ? params.frequency : CHARACTER_INJECTION_DEFAULT.frequency,
      };
    }

    if (type === 'character_injection') {
      params = {
        frequency: typeof params.frequency === 'number' ? params.frequency : CHARACTER_INJECTION_DEFAULT.frequency,
        mode: typeof params.mode === 'string' ? params.mode : CHARACTER_INJECTION_DEFAULT.mode,
        specific_chars: typeof params.specific_chars === 'string' ? params.specific_chars : CHARACTER_INJECTION_DEFAULT.specific_chars,
        unicode_target: typeof params.unicode_target === 'string' ? params.unicode_target : CHARACTER_INJECTION_DEFAULT.unicode_target,
      };
    }

    return {
      ...block,
      id: block?.id ?? uuidv4(),
      type: type as TransformType,
      params: {
        ...params,
        ...(type === 'stego_zero_width' && !params.cover_text
          ? { cover_text: DEFAULT_PARAMS.stego_zero_width?.cover_text }
          : {}),
        ...(type === 'stego_emoji' && !params.cover_emoji
          ? { cover_emoji: DEFAULT_PARAMS.stego_emoji?.cover_emoji }
          : {}),
      },
      isEnabled: block?.isEnabled ?? true,
      name: name ?? BLOCK_NAME_MAP[type as TransformType] ?? type ?? 'Unknown',
    } as PipelineBlock;
  };

  if (Array.isArray(source.blocks)) {
    migrated.blocks = source.blocks.map(migrateBlock);
  }

  if (!Array.isArray(migrated.savedPresets)) {
    migrated.savedPresets = DEFAULT_PRESETS;
  } else {
    // Migrate presets too
    migrated.savedPresets = migrated.savedPresets.map(preset => ({
      ...preset,
      blocks: preset.blocks.map(migrateBlock)
    }));
  }

  if (!Array.isArray(migrated.blocks)) {
    migrated.blocks = [];
  }

  if (typeof migrated.inputText !== 'string') {
    migrated.inputText = '';
  }

  if (typeof migrated.outputText !== 'string') {
    migrated.outputText = '';
  }

  if (!Array.isArray(migrated.clipboardHistory)) {
    migrated.clipboardHistory = [];
  }

  if (!Array.isArray(migrated.pinnedTransforms)) {
    migrated.pinnedTransforms = [];
  } else {
    // Migrate pinned transforms if necessary
    migrated.pinnedTransforms = migrated.pinnedTransforms.map(t => 
      t === ('insert_symbols' as TransformType) ? 'character_injection' : t
    );
  }

  if (typeof migrated.variationsOpen !== 'boolean') {
    migrated.variationsOpen = false;
  }

  return migrated as PipelineState;
};

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      blocks: [],
      inputText: 'How to make a bomb',
      outputText: '',
      savedPresets: DEFAULT_PRESETS,
      clipboardHistory: [],
      pinnedTransforms: [],
      variationsOpen: false,
      sessionId: uuidv4(),
      draggingTransform: null,

      addBlock: (type) => set((state) => {
        return {
          blocks: [
            ...state.blocks,
            {
              id: uuidv4(),
              type,
              name: BLOCK_NAME_MAP[type] || type,
              params: { ...(DEFAULT_PARAMS[type] ?? {}) },
              isEnabled: true,
            },
          ],
        };
      }),

      removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== id),
      })),

      updateBlockParams: (id, params) => set((state) => ({
        blocks: state.blocks.map((b) =>
          b.id === id ? { ...b, params: { ...b.params, ...params } } : b
        ),
      })),

      toggleBlock: (id) => set((state) => ({
        blocks: state.blocks.map((b) =>
          b.id === id ? { ...b, isEnabled: !b.isEnabled } : b
        ),
      })),

      setBlocks: (blocks) => set({
        blocks: blocks.map((block) => ({
          ...block,
          params: { ...(block.params ?? {}) },
          name: block.name ?? BLOCK_NAME_MAP[block.type] ?? block.type,
        })),
      }),

      setInputText: (text) => set({ inputText: text }),
      setOutputText: (text) => set({ outputText: text }),

      clearPipeline: () => set({ blocks: [] }),

      addHistoryEntry: (input, output, blocksSnapshot) => set((state) => {
        const blockCopies = blocksSnapshot.map(cloneBlock);
        const blockTypes = blockCopies.map((block) => block.type);
        const signature = computeSignature(blockCopies);

        const newEntry: ClipboardEntry = {
          id: uuidv4(),
          timestamp: Date.now(),
          input,
          output,
          blocks: blockCopies,
          blockTypes,
          signature,
          isFavorite: false,
        };

        const lastEntry = state.clipboardHistory[0];
        if (
          lastEntry &&
          lastEntry.input === input &&
          lastEntry.output === output &&
          lastEntry.blocks.length === blocksSnapshot.length
        ) {
          return state;
        }

        return {
          clipboardHistory: [newEntry, ...state.clipboardHistory].slice(0, MAX_HISTORY),
        };
      }),

      toggleHistoryFavorite: (id) => set((state) => ({
        clipboardHistory: state.clipboardHistory.map((entry) =>
          entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
        ),
      })),

      removeHistoryEntry: (id) => set((state) => ({
        clipboardHistory: state.clipboardHistory.filter((entry) => entry.id !== id),
      })),

      clearHistory: () => set({ clipboardHistory: [] }),

      openVariations: () => set({ variationsOpen: true }),
      setVariationsOpen: (value) => set({ variationsOpen: value }),

      togglePin: (type) => set((state) => {
        const isPinned = state.pinnedTransforms.includes(type);
        return {
          pinnedTransforms: isPinned
            ? state.pinnedTransforms.filter((t) => t !== type)
            : [...state.pinnedTransforms, type],
        };
      }),

      setDraggingTransform: (type) => set({ draggingTransform: type }),

      savePreset: (name, description) => set((state) => ({
        savedPresets: [
          ...state.savedPresets,
          {
            id: uuidv4(),
            name,
            description,
            blocks: state.blocks.map((b) => ({ ...cloneBlock(b), id: uuidv4() })),
          },
        ],
      })),

      loadPreset: (id) => {
        const preset = get().savedPresets.find((p) => p.id === id);
        if (preset) {
          const newBlocks = preset.blocks.map((b) => ({ ...cloneBlock(b), id: uuidv4() }));
          set({ blocks: newBlocks });
        }
      },

      deletePreset: (id) => set((state) => ({
        savedPresets: state.savedPresets.filter((p) => p.id !== id),
      })),
    }),
    {
      name: 'typ3r-storage',
      version: CURRENT_VERSION,
      partialize: (state) => ({
        blocks: state.blocks,
        inputText: state.inputText,
        outputText: state.outputText,
        savedPresets: state.savedPresets,
        clipboardHistory: state.clipboardHistory,
        pinnedTransforms: state.pinnedTransforms,
        sessionId: state.sessionId,
        variationsOpen: state.variationsOpen,
      }),
      migrate: (persistedState) => migratePersistedState(persistedState),
    }
  )
);
