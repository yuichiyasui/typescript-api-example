import { describe, expect, it, vi } from "vitest";

import { registerUser } from "./users.js";
import { User } from "../../domain/user.js";

// Password value object をモック化
vi.mock("../../domain/value/password.js", () => ({
  Password: {
    validate: vi.fn(),
  },
}));

// User entity をモック化
vi.mock("../../domain/user.js", () => ({
  User: {
    create: vi.fn(),
  },
}));

import { Password } from "../../domain/value/password.js";

describe("registerUser", () => {
  it("正常なユーザー登録が成功する", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    vi.mocked(Password.validate).mockReturnValue({
      isValid: true,
      errors: [],
    });

    const mockUser = { id: "user123" } as any;
    vi.mocked(User.create).mockResolvedValue(mockUser);

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
      expect(result.userId).toBe("user123");
    }

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    expect(Password.validate).toHaveBeenCalledWith("StrongPassword123!");
    expect(User.create).toHaveBeenCalledWith("Test User", "test@example.com", "StrongPassword123!");
  });

  it("パスワード検証失敗時はエラーを返す", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    vi.mocked(Password.validate).mockReturnValue({
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
    expect(Password.validate).toHaveBeenCalledWith("weak");
  });

  it("既存のメールアドレスでの登録は失敗する", async () => {
    const existingUser = { id: "existing-user" } as any;

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      findById: vi.fn(),
    };

    vi.mocked(Password.validate).mockReturnValue({
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
    expect(Password.validate).toHaveBeenCalledWith("StrongPassword123!");
  });

  it("パスワードハッシュ化後にユーザーを保存する", async () => {
    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    vi.mocked(Password.validate).mockReturnValue({
      isValid: true,
      errors: [],
    });

    const mockUser = {
      id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "member",
    } as any;
    vi.mocked(User.create).mockResolvedValue(mockUser);

    await registerUser(
      { usersRepository: mockUsersRepository },
      {
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      },
    );

    expect(mockUsersRepository.save).toHaveBeenCalledWith(mockUser);
    expect(User.create).toHaveBeenCalledWith("Test User", "test@example.com", "StrongPassword123!");
  });
});