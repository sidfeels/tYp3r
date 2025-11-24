# tYp3r v2 Backend

FastAPI-based backend for the tYp3r v2 prompt obfuscation toolkit.

## Architecture

```
backend/
├── main.py              # FastAPI app entry point
├── api/
│   └── routes.py        # API endpoints (/process, /tokenize, /fuzz, /stego)
├── core/
│   ├── engine.py        # Pipeline execution engine
│   ├── fuzzer.py        # Text mutation/fuzzing
│   ├── steganography.py # Zero-width and emoji stego
│   ├── transforms/      # Transform implementations
│   │   ├── basic.py     # Leetspeak, random case, whitespace injection
│   │   ├── encodings.py # Base64, hex, binary, URL encoding
│   │   ├── ciphers.py   # ROT13, Caesar, Morse, Rail Fence
│   │   ├── visual.py    # Zalgo, upside down, bubble text
│   │   ├── unicode_styles.py  # Medieval, cursive fonts
│   │   └── fantasy.py   # Pig Latin
│   └── utils/
│       └── tokenizer.py # tiktoken wrapper
└── tests/
    ├── test_transforms.py  # Transform unit tests
    └── test_api.py         # API endpoint tests
```

## Setup

### Prerequisites
- Python 3.12+
- `uv` package manager (recommended) or pip

### Installation

```bash
cd backend

# Using uv (recommended)
uv sync

# Or using pip
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
```

### Install Dev Dependencies

```bash
# Using uv
uv sync --extra dev

# Using pip
pip install -e ".[dev]"
```

## Running the Server

```bash
# Activate venv first (if using pip)
source .venv/bin/activate

# Start development server with auto-reload
uvicorn main:app --reload --port 8000

# Or specify host for network access
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Swagger docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## Environment Variables

```bash
# CORS allowed origins (comma-separated)
export ALLOWED_ORIGINS="http://localhost:3000,http://192.168.1.5:3000"
```

## API Endpoints

### `POST /api/process`
Execute a transformation pipeline on input text.

**Request:**
```json
{
  "text": "Hello World",
  "pipeline": {
    "blocks": [
      {"id": "1", "type": "base64", "params": {}, "isEnabled": true},
      {"id": "2", "type": "reverse", "params": {}, "isEnabled": true}
    ]
  }
}
```

**Response:**
```json
{
  "result": "==gNWZmZ",
  "steps": []
}
```

### `GET /api/transforms`
List all available transform types.

### `POST /api/tokenize`
Count tokens in text using tiktoken.

**Request:**
```json
{
  "text": "Hello World",
  "model": "gpt-4"
}
```

### `POST /api/fuzz`
Generate text variations for mutation testing.

**Request:**
```json
{
  "text": "attack",
  "count": 10,
  "strategies": []
}
```

### `POST /api/stego/encode`
Encode hidden text using steganography.

### `POST /api/stego/decode`
Decode hidden text from steganographic output.

### `GET /health`
Health check with version and uptime info.

## Adding New Transforms

1. **Create transform function** in appropriate module under `core/transforms/`
   ```python
   def my_transform(text: str, param: int = 10) -> str:
       return text * param
   ```

2. **Register in engine** (`core/engine.py`)
   ```python
   from .transforms.basic import my_transform
   engine.register("my_transform", my_transform)
   ```

3. **Add validation** (if needed) in `core/engine.py` `PipelineBlock.params_guard`

4. **Write tests** in `tests/test_transforms.py`
   ```python
   def test_my_transform():
       assert my_transform("hi", param=2) == "hihi"
   ```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=core --cov=api

# Run specific test file
pytest tests/test_transforms.py

# Run specific test
pytest tests/test_api.py::test_process_endpoint_returns_result
```

## Deterministic Transforms

Random-based transforms (leetspeak, random_case, insert_whitespace, insert_symbols) accept an optional `_seed` parameter for reproducible output:

```python
leetspeak("attack", intensity=1.0, _seed=1337)  # Always same output
```

When called via the API, the engine automatically derives seeds from input hash + block position to ensure consistency.

## CORS Configuration

By default, the backend allows:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8000`

For production or internal network deployment, set `ALLOWED_ORIGINS`:

```bash
export ALLOWED_ORIGINS="http://192.168.1.10:3000,https://typ3r.company.com"
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

**Import errors**: Ensure you're in the backend directory and virtual environment is activated.

**Port already in use**: Change port with `--port 8001` or kill existing process.

**tiktoken errors**: Reinstall tiktoken: `pip install --force-reinstall tiktoken`

**CORS issues**: Check `ALLOWED_ORIGINS` includes your frontend URL.

## Development Notes

- Transform functions should be pure (same input → same output, except when using controlled randomness with seeds)
- Use Pydantic validators in `routes.py` for input validation
- Keep transforms lightweight; heavy processing should be opt-in
- API response times target <100ms for simple pipelines
