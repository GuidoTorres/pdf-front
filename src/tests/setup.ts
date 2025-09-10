/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock fetch
global.fetch = jest.fn();

// Mock File and FileReader
global.File = class File {
  constructor(chunks: any[], filename: string, options?: any) {
    return {
      name: filename,
      size: chunks.reduce((acc, chunk) => acc + chunk.length, 0),
      type: options?.type || "",
      lastModified: Date.now(),
    } as File;
  }
};

global.FileReader = class FileReader {
  result: string | ArrayBuffer | null = null;
  error: any = null;
  readyState: number = 0;

  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null =
    null;

  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = "data:application/pdf;base64,mock-base64-data";
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  readAsText(file: Blob) {
    setTimeout(() => {
      this.result = "mock file content";
      this.readyState = 2;
      if (this.onload) {
        this.onload({} as ProgressEvent<FileReader>);
      }
    }, 0);
  }

  abort() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-object-url");
global.URL.revokeObjectURL = jest.fn();

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
