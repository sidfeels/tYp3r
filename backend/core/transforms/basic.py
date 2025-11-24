import random
import re
from typing import Dict, List, Optional

from pyfiglet import Figlet

def generate_leet_dict() -> Dict[str, List[str]]:
    return {
        'A': ['4', '@', 'α', 'Δ'], 'B': ['8', 'ß', '฿'], 'C': ['(', '¢', '©'],
        'D': ['|)', 'Ð', 'đ'], 'E': ['3', '€', 'ë'], 'F': ['ƒ', 'Ϝ', 'ℱ'],
        'G': ['6', '9', 'ğ'], 'H': ['#', 'ħ', 'Ħ'], 'I': ['1', '!', '|'],
        'J': ['ĵ', 'נ', 'Ĵ'], 'K': ['|<', 'Ҡ', 'ķ'], 'L': ['£', '|_', 'ℓ'],
        'M': ['|V|', 'м', 'Μ'], 'N': ['И', 'ñ', 'ŋ'], 'O': ['0', 'ø', 'Ω'],
        'P': ['|°', 'Þ', 'ρ'], 'Q': ['Q', 'Ҩ', 'ℚ'], 'R': ['Я', 'ř', '®'],
        'S': ['5', '$', 'ş'], 'T': ['7', '+', 'τ'], 'U': ['µ', 'Ü', 'Ц'],
        'V': ['\/','√', 'Ṽ'], 'W': ['Ш', 'ω', 'Ŵ'], 'X': ['×', 'Ж', '×'],
        'Y': ['¥', 'Ӳ', 'ý'], 'Z': ['2', 'Ž', 'ζ']
    }

LEET_DICT = generate_leet_dict()

UNICODE_PRESETS = {
    "zwsp": "\u200B",  # Zero Width Space
    "zwnj": "\u200C",  # Zero Width Non-Joiner
    "zwj": "\u200D",   # Zero Width Joiner
    "shy": "\u00AD",   # Soft Hyphen
    "rtl": "\u200F",   # Right-to-Left Mark
    "ltr": "\u200E",   # Left-to-Right Mark
    "wj": "\u2060",    # Word Joiner
}

def _seed_rng(seed: Optional[int] = None) -> None:
    if seed is not None:
        random.seed(seed)


def leetspeak(text: str, intensity: float = 0.5, _seed: Optional[int] = None) -> str:
    """
    Replace characters with leetspeak alternatives based on intensity (0.0 to 1.0).
    """
    _seed_rng(_seed)
    result = ""
    for char in text:
        if char.upper() in LEET_DICT and random.random() < intensity:
            result += random.choice(LEET_DICT[char.upper()])
        else:
            result += char
    return result

def random_case(text: str, intensity: float = 0.3, _seed: Optional[int] = None) -> str:
    """
    Randomly swap case of characters.
    """
    _seed_rng(_seed)
    result = ""
    for char in text:
        if random.random() < intensity:
            result += char.swapcase()
        else:
            result += char
    return result

def insert_whitespace(text: str, frequency: float = 0.2, _seed: Optional[int] = None) -> str:
    """
    Insert random spaces within the text.
    """
    _seed_rng(_seed)
    result = ""
    for char in text:
        result += char
        if random.random() < frequency:
            result += ' ' * random.randint(1, 2)
    return result

def _should_inject(probability: float) -> bool:
    if probability <= 0:
        return False
    if probability >= 1:
        return True
    return random.random() < probability


def _build_specific_pool(raw: str) -> List[str]:
    cleaned = raw.strip()
    if not cleaned:
        return ["#", "@", "!", "%"]

    if re.search(r"[,\n|]", raw):
        tokens = [token.strip() for token in re.split(r"[,\n|]+", raw) if token.strip()]
        if tokens:
            return tokens
    return [cleaned]


def character_injection(
    text: str, 
    frequency: float = 0.1, 
    mode: str = "random", 
    specific_chars: str = "#@!%", 
    unicode_target: str = "zwsp", 
    _seed: Optional[int] = None
) -> str:
    """
    Inject characters into text based on mode.
    Modes:
    - random: Inject random symbols from default set
    - specific: Inject characters from specific_chars string
    - unicode: Inject unicode character from presets
    """
    _seed_rng(_seed)
    
    injection_pool = []
    
    if mode == "specific":
        injection_pool = _build_specific_pool(specific_chars)
    elif mode == "unicode":
        target = UNICODE_PRESETS.get(unicode_target, "\u200B")
        injection_pool = [target]
    else: # random
        injection_pool = ['#', '@@', '%%', '&&', '**', '!!', '??', '$$']
        
    result = []
    # We can inject between any characters, not just words
    # The previous insert_symbols only did words, let's make it character-based for more granularity
    # Or keep word-based if that's preferred. The user said "character injection", implies characters.
    # Let's do character based injection for finer control like insert_whitespace.
    
    # Interpret frequency as: 0 => inject after every char, 1 => never inject
    if frequency <= 0:
        inject_probability = 1.0
    elif frequency >= 1:
        inject_probability = 0.0
    else:
        inject_probability = max(0.0, min(1.0, 1 - frequency))

    for char in text:
        result.append(char)
        if _should_inject(inject_probability):
            result.append(random.choice(injection_pool))
            
    return "".join(result)

def insert_symbols(text: str, frequency: float = 0.1, _seed: Optional[int] = None) -> str:
    """
    Legacy wrapper for character_injection
    """
    return character_injection(text, frequency=frequency, mode="random", _seed=_seed)

ASCII_ART_FONTS = [
    "standard",
    "slant",
    "small",
    "banner3-D",
    "doom",
    "digital",
]

def ascii_art(text: str, font: str = "standard", width: int = 80) -> str:
    """
    Render text as ASCII art using pyfiglet.
    """
    target_font = font if font in ASCII_ART_FONTS else "standard"
    width = max(20, min(width, 200))
    try:
        figlet = Figlet(font=target_font, width=width)
    except Exception:
        figlet = Figlet(font="standard", width=width)
    return figlet.renderText(text)

# Base64, Rot13, etc.
import base64

def to_base64(text: str) -> str:
    return base64.b64encode(text.encode()).decode()

def to_rot13(text: str) -> str:
    import codecs
    return codecs.encode(text, 'rot_13')

def reverse_text(text: str) -> str:
    return text[::-1]

def mirror_text(text: str) -> str:
    """
    Mirror the text horizontally (same as reversing character order).
    """
    return text[::-1]
