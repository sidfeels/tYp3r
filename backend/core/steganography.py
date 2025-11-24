def encode_zero_width(hidden_text: str, cover_text: str = "This is a normal sentence.") -> str:
    """
    Hide text using zero-width characters.
    Scheme: Binary encoding using ZWSP (U+200B) for 1 and ZWNJ (U+200C) for 0.
    """
    binary = ''.join(format(ord(c), '08b') for c in hidden_text)
    hidden_sequence = ""
    for bit in binary:
        if bit == '1':
            hidden_sequence += '\u200B' # Zero Width Space
        else:
            hidden_sequence += '\u200C' # Zero Width Non-Joiner
            
    # Insert hidden sequence after the first character of cover text to avoid stripping
    if not cover_text:
        return hidden_sequence
    insertion_point = min(len(cover_text), 1)
    return cover_text[:insertion_point] + hidden_sequence + cover_text[insertion_point:]

def decode_zero_width(text: str) -> str:
    """
    Extract and decode hidden zero-width text.
    """
    binary = ""
    for char in text:
        if char == '\u200B':
            binary += '1'
        elif char == '\u200C':
            binary += '0'
            
    decoded = ""
    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        if len(byte) == 8:
            decoded += chr(int(byte, 2))
    return decoded

def encode_emoji_stego(hidden_text: str, cover_emoji: str = "🐍") -> str:
    """
    Hide text using Emoji Variation Selectors.
    VS15 (U+FE0E) = 0, VS16 (U+FE0F) = 1
    """
    binary = ''.join(format(ord(c), '08b') for c in hidden_text)
    hidden_sequence = ""
    for bit in binary:
        if bit == '0':
            hidden_sequence += '\uFE0E' # VS15
        else:
            hidden_sequence += '\uFE0F' # VS16
            
    return cover_emoji + hidden_sequence

def decode_emoji_stego(text: str) -> str:
    """
    Extract text hidden with variation selectors.
    """
    binary = ""
    for char in text:
        if char == '\uFE0E':
            binary += '0'
        elif char == '\uFE0F':
            binary += '1'
            
    decoded = ""
    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        if len(byte) == 8:
            decoded += chr(int(byte, 2))
    return decoded

