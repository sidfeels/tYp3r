import streamlit as st
import random
import pyperclip
from typing import Dict, List

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

def subtle_text_transformer(text: str) -> str:
    leet_dict = generate_leet_dict()
    words = text.split()
    transformed_words = []
    word_count = 0
    symbol_count = 0

    symbols = ['#', '@@', '%%', '&&', '**', '!!']

    for word in words:
        word_count += 1
        transformed_word = ""

        for char in word:
            if char.upper() in leet_dict and random.random() < 0.25:
                transformed_word += random.choice(leet_dict[char.upper()])
            else:
                transformed_word += char.swapcase() if random.random() < 0.3 else char

        if word_count % random.randint(5, 6) == 0 and len(transformed_word) > 3:
            split_index = random.randint(1, len(transformed_word) - 1)
            transformed_word = transformed_word[:split_index] + ' ' * random.randint(1, 2) + transformed_word[split_index:]

        transformed_words.append(transformed_word)

        if word_count % random.randint(4, 5) == 0:
            transformed_words.append(' ' * random.randint(2, 3))

        symbol_count += 1
        if symbol_count % random.randint(6, 7) == 0:
            transformed_words.append(random.choice(symbols))

    return ' '.join(transformed_words)

st.set_page_config(layout="wide", page_title="t¥ρEr", page_icon="❄️")

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .stApp {
        background-color: #1e1e1e;
        color: #e0e0e0;
    }

    h1, h2, h3 {
        color: #bb86fc;
    }

    .stTextInput > div > div > input, .stTextArea > div > div > textarea {
        background-color: #2d2d2d;
        border: 1px solid #3d3d3d;
        border-radius: 4px;
        color: #e0e0e0;
        font-size: 16px;
    }

    .stButton > button {
        background-color: #bb86fc;
        color: #1e1e1e;
        font-weight: 600;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        transition: all 0.3s ease;
    }

    .stButton > button:hover {
        background-color: #a366f0;
        box-shadow: 0 2px 5px rgba(187, 134, 252, 0.3);
    }

    .css-1v0mbdj.etr89bj1 {
        width: 100%;
        padding: 1rem;
        border-radius: 4px;
        background-color: #2d2d2d;
        margin-top: 1rem;
    }

    .css-1v0mbdj.etr89bj1 > img {
        display: none;
    }

    a {
        color: #bb86fc;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
</style>
""", unsafe_allow_html=True)

st.title("☯ t¥ρEr")

col1, col2 = st.columns(2)

with col1:
    st.markdown("### Input Text")
    text_input = st.text_area("Enter your text here:", height=200, key="input")
    convert_button = st.button("🔄 Convert")

with col2:
    st.markdown("### Transformed Text")
    if text_input and convert_button:
        transformed_text = subtle_text_transformer(text_input)
        st.text_area("Result:", transformed_text, height=200, key="output")

        if st.button("📋 Copy to Clipboard"):
            pyperclip.copy(transformed_text)
            st.success("Copied to clipboard!")


        if 'history' not in st.session_state:
            st.session_state.history = []
        st.session_state.history.append((text_input, transformed_text))

if 'history' not in st.session_state:
    st.session_state.history = []

if st.session_state.history:
    st.markdown("### Recent Transformations")
    for i, (original, transformed) in enumerate(reversed(st.session_state.history[-3:])):
        with st.expander(f"Transformation {len(st.session_state.history) - i}"):
            st.markdown(f"**Original:** {original[:50]}..." if len(original) > 50 else f"**Original:** {original}")
            st.markdown(f"**Transformed:** {transformed[:50]}..." if len(transformed) > 50 else f"**Transformed:** {transformed}")


st.markdown("""
---
<p style="text-align: center; color: #bb86fc;">
    Made by <a href="https://github.com/sidfeels">sidfeels</a> |
    <a href="https://github.com/sidfeels/tYp3r">Open Source</a> |
    <a href="https://www.buymeacoffee.com/sidfeels">Buy Me a Coffee</a>
</p>
""", unsafe_allow_html=True)