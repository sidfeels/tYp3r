# tYp3r

tYp3r is a browser-based obfuscation lab: drag blocks into a pipeline, tweak a couple of knobs, and export payloads that are harder to fingerprint. Everything runs locally (FastAPI backend + Next.js frontend) so you can self-host or ship it to Vercel.

## What the Obfuscation Blocks Do

- **Encoders & Ciphers** – Base64/Base32/Hex/Binary, ROT13/47, Caesar, Morse, URL/HTML encode, etc.
- **Visual Mutations** – Leetspeak, casing waves, vaporwave/fullwidth, upside-down text, ASCII Art (pyfiglet fonts), and invisible-tag output.
- **Character Injection** – Injects specific tokens, random symbol sets, or any Unicode preset (ZWSP, ZWNJ, etc.) with density control.
- **Whitespace & Noise** – Random spaces/tabs, word splitting, templated wrappers, combinations with encoders.
- **Steganography** – Zero-width (ZWSP/ZWNJ) and Emoji Variation Selector encoders/decoders to hide payloads inside benign text.
- **History & Pins** – Pin favorite transforms for one-click access and keep only the runs you copied (history saves on copy).

## Local Development

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pydantic tiktoken art pyfiglet pytest pytest-asyncio httpx
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Set `NEXT_PUBLIC_API_URL` if the backend isn’t on `http://localhost:8000`.

## Deploying
1. Push the repo (plans/legacy notes are gitignored).
2. Deploy the frontend to Vercel (Next.js 14). Set `NEXT_PUBLIC_API_URL` to your backend url.
3. Host the FastAPI service (Render, Fly, EC2, etc.) and make sure CORS allows the Vercel domain.

## Disclaimer
Use tYp3r responsibly. It exists to probe model defenses and improve safety, not to ship malicious traffic.

