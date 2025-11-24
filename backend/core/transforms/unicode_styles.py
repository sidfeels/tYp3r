def to_medieval(text: str) -> str:
    # Mapping a-z to Fraktur/Gothic
    # Simplified mapping for range calculation
    def medieval_char(c):
        if 'a' <= c <= 'z': return chr(0x1D51E + ord(c) - ord('a'))
        if 'A' <= c <= 'Z': return chr(0x1D504 + ord(c) - ord('A'))
        return c
    return "".join(medieval_char(c) for c in text)

def to_cursive(text: str) -> str:
    def cursive_char(c):
        if 'a' <= c <= 'z': return chr(0x1D4B6 + ord(c) - ord('a'))
        if 'A' <= c <= 'Z': return chr(0x1D49C + ord(c) - ord('A'))
        return c
    return "".join(cursive_char(c) for c in text)

def to_double_struck(text: str) -> str:
    def ds_char(c):
        if 'a' <= c <= 'z': return chr(0x1D552 + ord(c) - ord('a'))
        if 'A' <= c <= 'Z': return chr(0x1D538 + ord(c) - ord('A'))
        if '0' <= c <= '9': return chr(0x1D7D8 + ord(c) - ord('0'))
        return c
    return "".join(ds_char(c) for c in text)

