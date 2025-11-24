type TransformHandler = (text: string) => string;

const reverse: TransformHandler = (text) => text.split("").reverse().join("");

const base64: TransformHandler = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (error) {
    console.error("Base64 encoding failed", error);
    return text;
  }
};

const rot13: TransformHandler = (text) =>
  text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });

const urlEncode: TransformHandler = (text) => encodeURIComponent(text);

const htmlEntities: TransformHandler = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const handlerMap: Record<string, TransformHandler> = {
  reverse,
  base64,
  rot13,
  url_encode: urlEncode,
  html_entities: htmlEntities,
};

interface ClientTransformResult {
  result: string;
  applied: boolean;
}

interface ClientPipelineBlock {
  type: string;
  isEnabled?: boolean;
}

export function applyClientTransforms(
  text: string,
  blocks: ClientPipelineBlock[]
): ClientTransformResult {
  let current = text;
  let applied = false;

  for (const block of blocks) {
    if (!block.isEnabled) continue;
    const handler = handlerMap[block.type];
    if (!handler) break;
    current = handler(current);
    applied = true;
  }

  return { result: current, applied };
}

export const CLIENT_TRANSFORM_KEYS = Object.keys(handlerMap);
