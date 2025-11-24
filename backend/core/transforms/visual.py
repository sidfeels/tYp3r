import random

def to_upside_down(text: str) -> str:
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.?!'\""
    upside = "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz∀BƆDƎℲפHIſK˥WNOԀQɹS┴∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86'˙¿¡,,"
    mapping = str.maketrans(chars, upside)
    return text.translate(mapping)[::-1]

def to_fullwidth(text: str) -> str:
    return "".join(chr(0xFEE0 + ord(c)) if 0x21 <= ord(c) <= 0x7E else c for c in text)

def to_bubble(text: str) -> str:
    # Basic mapping for a-z, A-Z, 0-9
    def bubble_char(c):
        if 'a' <= c <= 'z': return chr(0x24D0 + ord(c) - ord('a'))
        if 'A' <= c <= 'Z': return chr(0x24B6 + ord(c) - ord('A'))
        if '1' <= c <= '9': return chr(0x2460 + ord(c) - ord('1'))
        if c == '0': return '⓪'
        return c
    return "".join(bubble_char(c) for c in text)

def to_small_caps(text: str) -> str:
    chars = "abcdefghijklmnopqrstuvwxyz"
    caps = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ"
    mapping = str.maketrans(chars, caps)
    return text.translate(mapping)

def to_vaporwave(text: str) -> str:
    return to_fullwidth(text.replace(" ", "　")) # Use ideographic space

def to_zalgo(text: str, intensity: float = 0.5) -> str:
    # Simplified Zalgo
    zalgo_up = [chr(x) for x in range(0x030d, 0x0315)] 
    zalgo_down = [chr(x) for x in range(0x0316, 0x031d)]
    zalgo_mid = [chr(x) for x in range(0x0334, 0x0339)]
    
    result = []
    for char in text:
        result.append(char)
        if random.random() < intensity:
            num_marks = random.randint(1, 3)
            for _ in range(num_marks):
                result.append(random.choice(zalgo_up + zalgo_down + zalgo_mid))
    return "".join(result)

def to_invisible(text: str) -> str:
    # Encode using Variation Selectors or Tag characters
    # Using Tag characters (U+E0000 block) makes it invisible but recoverable
    return "".join(chr(0xE0000 + ord(c)) for c in text)

