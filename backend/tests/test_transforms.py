import pytest

from core.engine import engine, TransformationPipeline, PipelineBlock
from core.transforms.basic import (
    leetspeak,
    random_case,
    insert_whitespace,
    insert_symbols,
    to_base64,
    to_rot13,
    reverse_text,
)
from core.transforms.encodings import to_base32, to_hex, to_binary, url_encode, html_entities
from core.transforms.ciphers import to_morse, caesar_cipher, rot47, rail_fence_cipher
from core.transforms.visual import to_fullwidth, to_upside_down


@pytest.mark.parametrize(
    "func,input_text,expected",
    [
        (to_base64, "hello", "aGVsbG8="),
        (to_rot13, "Attack at dawn", "Nggnpx ng qnja"),
        (reverse_text, "abc", "cba"),
        (to_base32, "hi", "NBUQ===="),
        (to_hex, "ab", "61 62"),
        (to_binary, "AB", "01000001 01000010"),
        (url_encode, "a b", "a%20b"),
        (html_entities, "<tag>", "&lt;tag&gt;"),
        (to_morse, "SOS", "... --- ..."),
        (caesar_cipher, "abc", "bcd"),
        (rot47, "Hi!", "w:P"),
        (rail_fence_cipher, "WEATTACKATDAWN", "WTAWETAKTANACD"),
        (to_fullwidth, "Hello", "Ｈｅｌｌｏ"),
        (to_upside_down, "Hello", "ollǝH"),
    ],
)
def test_deterministic_transforms(func, input_text, expected):
    assert func(input_text) == expected


def test_leetspeak_seeded():
    first = leetspeak("attack", intensity=1.0, _seed=1337)
    second = leetspeak("attack", intensity=1.0, _seed=1337)
    assert first == second


def test_random_case_seeded():
    first = random_case("Attack", intensity=1.0, _seed=42)
    second = random_case("Attack", intensity=1.0, _seed=42)
    assert first == second


def test_insert_whitespace_seeded():
    first = insert_whitespace("abcdef", frequency=0.9, _seed=21)
    second = insert_whitespace("abcdef", frequency=0.9, _seed=21)
    assert first == second


def test_insert_symbols_seeded():
    first = insert_symbols("we attack", frequency=0.9, _seed=100)
    second = insert_symbols("we attack", frequency=0.9, _seed=100)
    assert first == second


def test_pipeline_execution_multiple_blocks_deterministic():
    pipeline = TransformationPipeline(
        blocks=[
            PipelineBlock(id="1", type="base64", params={}, isEnabled=True),
            PipelineBlock(id="2", type="reverse", params={}, isEnabled=True),
            PipelineBlock(id="3", type="rot13", params={}, isEnabled=True),
        ]
    )
    output = engine.process("test", pipeline, seed=1234)
    assert output == "==NqmITq"


def test_pipeline_skips_disabled_blocks():
    pipeline = TransformationPipeline(
        blocks=[
            PipelineBlock(id="1", type="base64", params={}, isEnabled=False),
            PipelineBlock(id="2", type="reverse", params={}, isEnabled=True),
        ]
    )
    output = engine.process("abc", pipeline)
    assert output == "cba"
