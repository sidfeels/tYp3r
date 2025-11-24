import hashlib
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator

class PipelineBlock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    type: str
    params: Dict[str, Any] = Field(default_factory=dict)
    isEnabled: bool = True

    @field_validator("params")
    @classmethod
    def params_guard(cls, params: Dict[str, Any], info):
        block_type = info.data.get("type")
        if block_type in {"leetspeak", "random_case", "zalgo"}:
            intensity = params.get("intensity")
            if intensity is not None and not (0 <= float(intensity) <= 1):
                raise ValueError("Intensity must be between 0 and 1")
        if block_type in {"insert_whitespace", "insert_symbols", "character_injection"}:
            frequency = params.get("frequency")
            if frequency is not None and not (0 <= float(frequency) <= 1):
                raise ValueError("Frequency must be between 0 and 1")
        if block_type == "caesar":
            shift = params.get("shift")
            if shift is not None and not (1 <= int(shift) <= 25):
                raise ValueError("Shift must be between 1 and 25")
        if block_type == "rail_fence":
            rails = params.get("rails")
            if rails is not None and not (2 <= int(rails) <= 10):
                raise ValueError("Rails must be between 2 and 10")
        return params

class TransformationPipeline(BaseModel):
    model_config = ConfigDict(extra="ignore")
    blocks: List[PipelineBlock]

class TransformEngine:
    def __init__(self):
        self.registry = {}

    def register(self, name: str, func):
        self.registry[name] = func

    def _derive_seed(self, text: str, block: PipelineBlock, position: int) -> int:
        params_items = "".join(
            f"{key}={block.params.get(key)}" for key in sorted(block.params.keys())
        )
        payload = f"{position}:{block.type}:{params_items}:{text}"
        digest = hashlib.sha256(payload.encode()).digest()
        return int.from_bytes(digest[:4], "big")

    def process(self, text: str, pipeline: TransformationPipeline, *, seed: Optional[int] = None) -> str:
        current_text = text
        for index, block in enumerate(pipeline.blocks):
            if not block.isEnabled:
                continue
            transform_func = self.registry.get(block.type)
            if not transform_func:
                continue

            block_params = dict(block.params)

            if seed is not None:
                block_seed = seed + index
            else:
                block_seed = self._derive_seed(current_text, block, index)

            if block.type in {
                "leetspeak",
                "random_case",
                "insert_whitespace",
                "insert_symbols",
                "character_injection",
            }:
                block_params.setdefault("_seed", block_seed)

            try:
                current_text = transform_func(current_text, **block_params)
            except Exception as exc:
                print(f"Error in block {block.type}: {exc}")
        return current_text

engine = TransformEngine()

# Auto-register all transforms
from .transforms.basic import (
    leetspeak, random_case, insert_whitespace, insert_symbols, character_injection,
    to_base64, to_rot13, reverse_text, mirror_text, ascii_art
)
from .transforms.encodings import (
    to_base32, to_hex, to_binary, url_encode, html_entities, to_ascii85
)
from .transforms.ciphers import (
    to_morse, caesar_cipher, rot47, rail_fence_cipher
)
from .transforms.visual import (
    to_upside_down, to_fullwidth, to_bubble, to_small_caps, to_vaporwave, to_zalgo, to_invisible
)
from .transforms.unicode_styles import (
    to_medieval, to_cursive, to_double_struck
)
from .transforms.fantasy import to_pig_latin
from .steganography import encode_zero_width, encode_emoji_stego

# Basic
engine.register("leetspeak", leetspeak)
engine.register("random_case", random_case)
engine.register("insert_whitespace", insert_whitespace)
engine.register("insert_symbols", insert_symbols)
engine.register("character_injection", character_injection)
engine.register("ascii_art", ascii_art)
engine.register("reverse", reverse_text)
engine.register("mirror", mirror_text)
engine.register("stego_zero_width", encode_zero_width)
engine.register("stego_emoji", encode_emoji_stego)

# Encodings
engine.register("base64", to_base64)
engine.register("base32", to_base32)
engine.register("hex", to_hex)
engine.register("binary", to_binary)
engine.register("url_encode", url_encode)
engine.register("html_entities", html_entities)
engine.register("ascii85", to_ascii85)

# Ciphers
engine.register("rot13", to_rot13)
engine.register("rot47", rot47)
engine.register("caesar", caesar_cipher)
engine.register("morse", to_morse)
engine.register("rail_fence", rail_fence_cipher)

# Visual
engine.register("upside_down", to_upside_down)
engine.register("fullwidth", to_fullwidth)
engine.register("bubble", to_bubble)
engine.register("small_caps", to_small_caps)
engine.register("vaporwave", to_vaporwave)
engine.register("zalgo", to_zalgo)
engine.register("invisible", to_invisible)

# Unicode Styles
engine.register("medieval", to_medieval)
engine.register("cursive", to_cursive)
engine.register("double_struck", to_double_struck)

# Fantasy/Fun
engine.register("pig_latin", to_pig_latin)
