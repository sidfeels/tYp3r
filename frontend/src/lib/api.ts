import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './config';
import { PipelineBlock } from '@/store/pipelineStore';

interface ProcessTextRequest {
  text: string;
  pipeline: {
    blocks: {
      id: string;
      type: string;
      params: Record<string, unknown>;
      isEnabled: boolean;
    }[];
  };
}

interface ProcessTextResponse {
  result: string;
  steps?: string[];
}

interface TokenizeRequest {
  text: string;
  model?: string;
}

interface TokenizeResponse {
  count: number;
  model: string;
}

interface FuzzRequest {
  text: string;
  count?: number;
  strategies?: string[];
}

interface FuzzResponse {
  results: FuzzResult[];
}

interface StegoDecodeRequest {
  text: string;
  method?: 'auto' | 'zero_width' | 'emoji';
}

interface StegoDecodeResponse {
  result: string;
}

interface ApiError {
  message: string;
  detail?: string;
}

export interface FuzzResult {
  strategy: string;
  output: string;
}

const isErrorResponse = (payload: unknown): payload is { detail?: unknown } => {
  return typeof payload === 'object' && payload !== null && 'detail' in payload;
};

const extractMessages = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (typeof entry === 'object' && entry !== null) {
          if ('msg' in entry && typeof (entry as { msg?: unknown }).msg === 'string') {
            return (entry as { msg: string }).msg;
          }
          return JSON.stringify(entry);
        }
        return String(entry);
      })
      .filter(Boolean);
    return parts.length ? parts.join('; ') : undefined;
  }
  if (typeof value === 'object') {
    if ('msg' in (value as { msg?: unknown }) && typeof (value as { msg?: unknown }).msg === 'string') {
      return (value as { msg: string }).msg;
    }
    return JSON.stringify(value);
  }
  return String(value);
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      if (axiosError.response) {
        const responseData: unknown = axiosError.response.data;
        const detailPayload = isErrorResponse(responseData) ? responseData.detail : responseData;
        const formattedDetail = extractMessages(detailPayload);
        return {
          message: `API Error: ${axiosError.response.status}`,
          detail: formattedDetail ?? axiosError.message
        };
      } else if (axiosError.request) {
        return {
          message: 'Backend unavailable',
          detail: 'Cannot connect to API. Is the backend running?'
        };
      }
    }
    return {
      message: 'Unknown error',
      detail: error instanceof Error ? error.message : String(error)
    };
  }

  async processText(text: string, blocks: PipelineBlock[]): Promise<{ data: ProcessTextResponse | null; error: ApiError | null }> {
    try {
      const payload: ProcessTextRequest = {
        text,
        pipeline: {
          blocks: blocks.map(({ id, type, params, isEnabled }) => ({
            id,
            type,
            params,
            isEnabled
          }))
        }
      };

      const response = await axios.post<ProcessTextResponse>(
        `${this.baseURL}/api/process`,
        payload,
        { timeout: 10000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async getTransforms(): Promise<{ data: { transforms: string[] } | null; error: ApiError | null }> {
    try {
      const response = await axios.get<{ transforms: string[] }>(
        `${this.baseURL}/api/transforms`,
        { timeout: 5000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async tokenizeText(text: string, model: string = 'gpt-4'): Promise<{ data: TokenizeResponse | null; error: ApiError | null }> {
    try {
      const payload: TokenizeRequest = { text, model };
      const response = await axios.post<TokenizeResponse>(
        `${this.baseURL}/api/tokenize`,
        payload,
        { timeout: 5000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async fuzzText(text: string, count: number = 10, strategies: string[] = []): Promise<{ data: FuzzResponse | null; error: ApiError | null }> {
    try {
      const payload: FuzzRequest = { text, count, strategies };
      const response = await axios.post<FuzzResponse>(
        `${this.baseURL}/api/fuzz`,
        payload,
        { timeout: 15000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async healthCheck(): Promise<{ data: { status: string; version?: string } | null; error: ApiError | null }> {
    try {
      const response = await axios.get<{ status: string; version?: string }>(
        `${this.baseURL}/health`,
        { timeout: 3000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }

  async decodeStego(text: string, method: StegoDecodeRequest['method'] = 'auto'): Promise<{ data: StegoDecodeResponse | null; error: ApiError | null }> {
    try {
      const payload: StegoDecodeRequest = { text, method };
      const response = await axios.post<StegoDecodeResponse>(
        `${this.baseURL}/api/stego/decode`,
        payload,
        { timeout: 5000 }
      );

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiError, ProcessTextResponse, TokenizeResponse, FuzzResponse, StegoDecodeResponse };
