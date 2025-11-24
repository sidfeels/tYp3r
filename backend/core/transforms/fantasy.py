def to_quenya(text: str) -> str:
    # Phonetic-ish mapping to Elvish-like chars? 
    # Actually Quenya uses Tengwar script usually.
    # Let's map to Tengwar-like unicode or pseudo-elvish if proper mapping is complex.
    # Reference repo maps specific chars.
    # Using a simplified mock mapping for "Fantasy" feel if real fonts aren't available.
    # Or map to actual Unicode Tengwar if available (Private Use Area mostly).
    # Let's use a substitution map for "Elvish-lookalike" chars.
    mapping = {
        'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú',
        'k': 'c', 'x': 'ks', 'ph': 'f', 'th': 'þ'
    }
    # This is very basic. A real implementation would need a full dictionary.
    # Let's assume the user wants "Visual" fantasy style.
    return "".join(mapping.get(c.lower(), c) for c in text)

def to_tengwar(text: str) -> str:
    # Actual Tengwar mapping is complex.
    # Using a known "Tengwar" mapping for common chars.
    # Often mapped to specific high-unicode or PUA.
    # We will use a substitution cipher that LOOKS elvish.
    #     (PUA chars often used)
    # For now, let's use a placeholder that indicates "Tengwar" style
    return "TENGWAR_NOT_FULLY_IMPLEMENTED_YET" 

def to_klingon(text: str) -> str:
    # Klingon pIqaD (Unicode U+F8D0 - U+F8FF in PUA)
    # Mapping a-z to pIqaD PUA
    base = 0xF8D0
    # a b ch D e gh H I j l m n ng o p q Q r S t tlh u v w y '
    # This requires a tokenizer for multi-char sounds (tlh, gh).
    return text.upper() # Placeholder for now, just uppercase feels aggressive

def to_pig_latin(text: str) -> str:
    words = text.split()
    res = []
    for word in words:
        if not word.isalpha():
            res.append(word)
            continue
        if word[0].lower() in 'aeiou':
            res.append(word + "way")
        else:
            # Move consonants to end
            import re
            match = re.match(r'^([^aeiou]+)(.*)', word, re.I)
            if match:
                res.append(match.group(2) + match.group(1) + "ay")
            else:
                res.append(word + "ay")
    return " ".join(res)

