import { TransformType } from "@/store/pipelineStore";

interface TransformCategory {
  name: string;
  items: {
    type: TransformType;
    name: string;
    description: string;
  }[];
}

export const TRANSFORM_CATEGORIES: TransformCategory[] = [
  {
    name: "Encodings",
    items: [
      { type: "base64", name: "Base64", description: "Standard Base64 encoding" },
      { type: "base32", name: "Base32", description: "Base32 encoding (A-Z, 2-7)" },
      { type: "hex", name: "Hexadecimal", description: "Convert text to hex values" },
      { type: "binary", name: "Binary", description: "Convert text to 0s and 1s" },
      { type: "url_encode", name: "URL Encode", description: "Safe for URLs (%20)" },
      { type: "html_entities", name: "HTML Entities", description: "Convert special chars to &entity;" },
      { type: "ascii85", name: "ASCII85", description: "Adobe ASCII85 encoding" },
    ]
  },
  {
    name: "Ciphers",
    items: [
      { type: "rot13", name: "ROT13", description: "Rotate characters by 13 places" },
      { type: "rot47", name: "ROT47", description: "Rotate ASCII by 47 places" },
      { type: "caesar", name: "Caesar Cipher", description: "Shift characters by N" },
      { type: "morse", name: "Morse Code", description: "Dots and dashes" },
      { type: "rail_fence", name: "Rail Fence", description: "Zig-zag transposition" },
    ]
  },
  {
    name: "Visual Obfuscation",
    items: [
      { type: "leetspeak", name: "Leetspeak", description: "Replace chars with lookalikes (hacker style)" },
      { type: "upside_down", name: "Upside Down", description: "Flip text 180 degrees" },
      { type: "reverse", name: "Reverse", description: "Reverse the entire string" },
      { type: "mirror", name: "Mirror", description: "Reflect text horizontally" },
      { type: "random_case", name: "Random Case", description: "RaNdOmLy cApItAlIzE letters" },
      { type: "fullwidth", name: "Full Width", description: "Ａｅｓｔｈｅｔｉｃ　ｔｅｘｔ" },
      { type: "bubble", name: "Bubble Text", description: "Ⓑⓤⓑⓑⓛⓔ ⓣⓔⓧⓣ" },
      { type: "small_caps", name: "Small Caps", description: "ꜱᴍᴀʟʟ ᴄᴀᴘɪᴛᴀʟꜱ" },
      { type: "vaporwave", name: "Vaporwave", description: "w i d e   t e x t" },
      { type: "zalgo", name: "Zalgo", description: "G̶l̶i̶t̶c̶h̶y̶ ̶t̶e̶x̶t̶" },
      { type: "invisible", name: "Invisible", description: "Hidden text using tag characters" },
      { type: "ascii_art", name: "ASCII Art", description: "Render text using FIGlet-style fonts" },
    ]
  },
  {
    name: "Unicode Styles",
    items: [
      { type: "medieval", name: "Medieval", description: "𝔊𝔬𝔱𝔥𝔦𝔠 𝔰𝔱𝔶𝔩𝔢" },
      { type: "cursive", name: "Cursive", description: "𝒞𝓊𝓇𝓈𝒾𝓋𝑒 𝓈𝒸𝓇𝒾𝓅𝓉" },
      { type: "double_struck", name: "Double Struck", description: "D𝕠𝕦𝕓𝕝𝕖 𝕤𝕥𝕣𝕦𝕔𝕜" },
    ]
  },
  {
    name: "Injection",
    items: [
      { type: "insert_whitespace", name: "Insert Whitespace", description: "Inject random spaces between characters" },
      { type: "character_injection", name: "Character Injection", description: "Inject characters (symbols, unicode, specific)" },
      { type: "stego_zero_width", name: "Zero-Width Stego", description: "Hide payload using zero-width characters inside cover text" },
      { type: "stego_emoji", name: "Emoji Stego", description: "Encode payload using emoji variation selectors" },
    ]
  },
  {
    name: "Fun / Other",
    items: [
      { type: "pig_latin", name: "Pig Latin", description: "Igpay Atinlay" },
    ]
  }
];
