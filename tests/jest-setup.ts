// Jest setup file that runs before all tests
import { TextEncoder, TextDecoder } from 'util';

// Mock globals first - required for MSW
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Response and Request for MSW
global.Response = class Response {
  constructor(body?: any, init?: ResponseInit) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Map();
  }
  
  async json() {
    return JSON.parse(this.body || '{}');
  }
  
  async text() {
    return this.body || '';
  }
} as any;

global.Request = class Request {
  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map();
    this.body = init?.body;
  }
  
  async json() {
    return JSON.parse(this.body as string || '{}');
  }
} as any;

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SESSION_SECRET = 'test-session-secret';

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};