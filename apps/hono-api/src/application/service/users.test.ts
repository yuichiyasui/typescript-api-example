import { describe, expect, it, vi } from "vitest";

import { registerUser } from "./users.js";
import { User } from "../../domain/user.js";

// Password validation and hashing utilities をモック化
vi.mock("../../infrastructure/password.js", () => ({
  validatePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

import { validatePassword, hashPassword } from "../../infrastructure/password.js";

describe("registerUser", () => {
  it("正常なユーザー登録が成功する", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    vi.mocked(validatePassword).mockReturnValue({
      isValid: true,
      errors: [],
    });

    vi.mocked(hashPassword).mockResolvedValue("hashedPassword123");

    const result = await registerUser(
      { usersRepository: mockUsersRepository },
      {
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userId).toBeDefined();
      expect(typeof result.userId).toBe("string");
    }

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockUsersRepository.save).toHaveBeenCalledOnce();
    expect(validatePassword).toHaveBeenCalledWith("StrongPassword123!");
    expect(hashPassword).toHaveBeenCalledWith("StrongPassword123!");
  });

  it("パスワード検証失敗時はエラーを返す", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    vi.mocked(validatePassword).mockReturnValue({
      isValid: false,
      errors: ["Password must be at least 8 characters long"],
    });

    const result = await registerUser(
      { usersRepository: mockUsersRepository },
      {
        name: "Test User",
        email: "test@example.com",
        password: "weak",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(["Password must be at least 8 characters long"]);
    }

    expect(mockUsersRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUsersRepository.save).not.toHaveBeenCalled();
    expect(validatePassword).toHaveBeenCalledWith("weak");
  });

  it("既存のメールアドレスでの登録は失敗する", async () => {
    const existingUser = User.create("Existing User", "test@example.com", "hashedPassword");

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      findById: vi.fn(),
    };

    vi.mocked(validatePassword).mockReturnValue({
      isValid: true,
      errors: [],
    });

    const result = await registerUser(
      { usersRepository: mockUsersRepository },
      {
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(["User with this email already exists"]);
    }

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockUsersRepository.save).not.toHaveBeenCalled();
    expect(validatePassword).toHaveBeenCalledWith("StrongPassword123!");
  });

  it("パスワードハッシュ化後にユーザーを保存する", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    vi.mocked(validatePassword).mockReturnValue({
      isValid: true,
      errors: [],
    });

    vi.mocked(hashPassword).mockResolvedValue("hashedPassword123");

    await registerUser(
      { usersRepository: mockUsersRepository },
      {
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      },
    );

    expect(mockUsersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword123",
        role: "member",
      }),
    );
  });
});