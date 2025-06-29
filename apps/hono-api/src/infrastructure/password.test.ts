import { describe, expect, it } from "vitest";

import { validatePassword, hashPassword, verifyPassword } from "./password.js";

describe("validatePassword", () => {
  it("有効なパスワードは通る", () => {
    const result = validatePassword("StrongPassword123!");
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("短すぎるパスワードは無効", () => {
    const result = validatePassword("Short1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters long");
  });

  it("長すぎるパスワードは無効", () => {
    const longPassword = "A".repeat(129) + "1!";
    const result = validatePassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be no more than 128 characters long");
  });

  it("小文字がないパスワードは無効", () => {
    const result = validatePassword("UPPERCASE123!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one lowercase letter");
  });

  it("大文字がないパスワードは無効", () => {
    const result = validatePassword("lowercase123!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one uppercase letter");
  });

  it("数字がないパスワードは無効", () => {
    const result = validatePassword("NoNumbers!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one number");
  });

  it("特殊文字がないパスワードは無効", () => {
    const result = validatePassword("NoSpecialChar123");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one special character");
  });

  it("複数の条件を満たさないパスワードは複数のエラーを返す", () => {
    const result = validatePassword("weak");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors).toContain("Password must be at least 8 characters long");
    expect(result.errors).toContain("Password must contain at least one uppercase letter");
    expect(result.errors).toContain("Password must contain at least one number");
    expect(result.errors).toContain("Password must contain at least one special character");
  });
});

describe("hashPassword and verifyPassword", () => {
  it("パスワードをハッシュ化し、検証できる", async () => {
    const password = "TestPassword123!";
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(0);

    const isValid = await verifyPassword(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  it("間違ったパスワードは検証に失敗する", async () => {
    const password = "TestPassword123!";
    const wrongPassword = "WrongPassword123!";
    const hashedPassword = await hashPassword(password);

    const isValid = await verifyPassword(wrongPassword, hashedPassword);
    expect(isValid).toBe(false);
  });

  it("同じパスワードでも異なるハッシュが生成される", async () => {
    const password = "TestPassword123!";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);

    const isValid1 = await verifyPassword(password, hash1);
    const isValid2 = await verifyPassword(password, hash2);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });
});