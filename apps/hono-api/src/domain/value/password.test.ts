import { describe, expect, it } from "vitest";

import { Password } from "./password.js";

describe("Password", () => {
  describe("validate", () => {
    it("有効なパスワードは通る", () => {
      const result = Password.validate("StrongPassword123!");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("短すぎるパスワードは無効", () => {
      const result = Password.validate("Short1!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters long");
    });

    it("長すぎるパスワードは無効", () => {
      const longPassword = "A".repeat(129) + "1!";
      const result = Password.validate(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must be no more than 128 characters long");
    });

    it("小文字がないパスワードは無効", () => {
      const result = Password.validate("UPPERCASE123!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one lowercase letter");
    });

    it("大文字がないパスワードは無効", () => {
      const result = Password.validate("lowercase123!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one uppercase letter");
    });

    it("数字がないパスワードは無効", () => {
      const result = Password.validate("NoNumbers!");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one number");
    });

    it("特殊文字がないパスワードは無効", () => {
      const result = Password.validate("NoSpecialChar123");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one special character");
    });

    it("複数の条件を満たさないパスワードは複数のエラーを返す", () => {
      const result = Password.validate("weak");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain("Password must be at least 8 characters long");
      expect(result.errors).toContain("Password must contain at least one uppercase letter");
      expect(result.errors).toContain("Password must contain at least one number");
      expect(result.errors).toContain("Password must contain at least one special character");
    });
  });

  describe("create", () => {
    it("有効なパスワードでPasswordインスタンスを作成できる", async () => {
      const password = await Password.create("StrongPassword123!");

      expect(password).toBeInstanceOf(Password);
      expect(password.hashedValue).toBeDefined();
      expect(password.hashedValue).not.toBe("StrongPassword123!");
      expect(password.hashedValue.length).toBeGreaterThan(0);
    });

    it("無効なパスワードでエラーが投げられる", async () => {
      await expect(Password.create("weak")).rejects.toThrow("Invalid password");
    });

    it("同じパスワードでも異なるハッシュが生成される", async () => {
      const password1 = await Password.create("StrongPassword123!");
      const password2 = await Password.create("StrongPassword123!");

      expect(password1.hashedValue).not.toBe(password2.hashedValue);
    });
  });

  describe("restore", () => {
    it("ハッシュ済みパスワードからPasswordインスタンスを復元できる", () => {
      const hashedPassword = "$2b$12$example.hash.here";
      const password = Password.restore(hashedPassword);

      expect(password).toBeInstanceOf(Password);
      expect(password.hashedValue).toBe(hashedPassword);
    });
  });

  describe("verify", () => {
    it("正しいパスワードで検証が成功する", async () => {
      const plainPassword = "StrongPassword123!";
      const password = await Password.create(plainPassword);

      const isValid = await password.verify(plainPassword);
      expect(isValid).toBe(true);
    });

    it("間違ったパスワードで検証が失敗する", async () => {
      const plainPassword = "StrongPassword123!";
      const wrongPassword = "WrongPassword123!";
      const password = await Password.create(plainPassword);

      const isValid = await password.verify(wrongPassword);
      expect(isValid).toBe(false);
    });
  });

  describe("equals", () => {
    it("同じハッシュ値のPasswordは等しい", () => {
      const hashedPassword = "$2b$12$example.hash.here";
      const password1 = Password.restore(hashedPassword);
      const password2 = Password.restore(hashedPassword);

      expect(password1.equals(password2)).toBe(true);
    });

    it("異なるハッシュ値のPasswordは等しくない", async () => {
      const password1 = await Password.create("StrongPassword123!");
      const password2 = await Password.create("AnotherPassword123!");

      expect(password1.equals(password2)).toBe(false);
    });
  });
});