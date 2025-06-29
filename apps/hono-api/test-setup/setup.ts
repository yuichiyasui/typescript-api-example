import { vi } from "vitest";

// Logger module をグローバルでモック化
vi.mock("../src/infrastructure/logger.ts", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnThis(),
    level: "info",
    fatal: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    silent: vi.fn(),
  },
}));
