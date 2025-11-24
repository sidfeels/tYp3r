from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import List, Dict, Any, Optional
from core.engine import engine, TransformationPipeline
from core.utils.tokenizer import count_tokens
from core.fuzzer import fuzzer
from core.steganography import encode_zero_width, decode_zero_width, encode_emoji_stego, decode_emoji_stego

router = APIRouter()

class ProcessRequest(BaseModel):
    text: str
    pipeline: TransformationPipeline

    @field_validator("text")
    @classmethod
    def text_length_guard(cls, value: str) -> str:
        if len(value) > 50000:
            raise ValueError("Input text exceeds 50k character limit")
        return value

    @field_validator("pipeline")
    @classmethod
    def pipeline_guard(cls, pipeline: TransformationPipeline) -> TransformationPipeline:
        if not pipeline.blocks:
            raise ValueError("Pipeline must include at least one block")
        for block in pipeline.blocks:
            if block.type not in engine.registry:
                raise ValueError(f"Unknown transform: {block.type}")
        return pipeline

class ProcessResponse(BaseModel):
    result: str
    steps: List[str] = []

class TokenizeRequest(BaseModel):
    text: str
    model: str = "gpt-4"

    @field_validator("text")
    @classmethod
    def tokenize_length_guard(cls, value: str) -> str:
        if len(value) > 50000:
            raise ValueError("Text too long to tokenize")
        return value

class TokenizeResponse(BaseModel):
    count: int
    model: str

class FuzzRequest(BaseModel):
    text: str
    count: int = 10
    strategies: List[str] = []

    @field_validator("count")
    @classmethod
    def count_guard(cls, value: int) -> int:
        if value < 1 or value > 50:
            raise ValueError("Count must be between 1 and 50")
        return value

    @field_validator("text")
    @classmethod
    def fuzz_length_guard(cls, value: str) -> str:
        if len(value) > 20000:
            raise ValueError("Input too long for mutation")
        return value

class FuzzResponse(BaseModel):
    results: List[Dict[str, Any]]

class StegoRequest(BaseModel):
    hidden_text: str
    cover_text: str = ""
    method: str = "zero_width"  # zero_width or emoji

    @field_validator("method")
    @classmethod
    def stego_method_guard(cls, value: str) -> str:
        if value not in {"zero_width", "emoji"}:
            raise ValueError("Method must be zero_width or emoji")
        return value

class StegoResponse(BaseModel):
    result: str

class StegoDecodeRequest(BaseModel):
    text: str
    method: str = "auto"

@router.post("/process", response_model=ProcessResponse)
async def process_text(request: ProcessRequest):
    try:
        result = engine.process(request.text, request.pipeline)
        return ProcessResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transforms")
async def list_transforms():
    """List available transformations"""
    return {"transforms": list(engine.registry.keys())}

@router.post("/tokenize", response_model=TokenizeResponse)
async def tokenize_text(request: TokenizeRequest):
    try:
        count = count_tokens(request.text, request.model)
        return TokenizeResponse(count=count, model=request.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fuzz", response_model=FuzzResponse)
async def fuzz_text(request: FuzzRequest):
    try:
        results = fuzzer.mutate(request.text, request.count, request.strategies)
        return FuzzResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stego/encode", response_model=StegoResponse)
async def stego_encode(request: StegoRequest):
    try:
        if request.method == "zero_width":
            res = encode_zero_width(request.hidden_text, request.cover_text or "This is normal text.")
        elif request.method == "emoji":
            res = encode_emoji_stego(request.hidden_text, request.cover_text or "🐍")
        else:
            raise HTTPException(status_code=400, detail="Invalid method")
        return StegoResponse(result=res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stego/decode", response_model=StegoResponse)
async def stego_decode(request: StegoDecodeRequest):
    try:
        # Simple auto-detection
        if '\u200B' in request.text or '\u200C' in request.text:
            res = decode_zero_width(request.text)
        elif '\uFE0E' in request.text or '\uFE0F' in request.text:
            res = decode_emoji_stego(request.text)
        else:
            res = "No hidden message detected."
        return StegoResponse(result=res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
