import base64
import binascii
import urllib.parse
import html

def to_base32(text: str) -> str:
    return base64.b32encode(text.encode()).decode()

def to_hex(text: str) -> str:
    return text.encode().hex(' ')

def to_binary(text: str) -> str:
    return ' '.join(format(ord(char), '08b') for char in text)

def url_encode(text: str) -> str:
    return urllib.parse.quote(text)

def html_entities(text: str) -> str:
    return html.escape(text)

def to_ascii85(text: str) -> str:
    return base64.a85encode(text.encode()).decode()

