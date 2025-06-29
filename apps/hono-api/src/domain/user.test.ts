import { describe, expect, it } from "vitest";

import { User } from "./user.js";

describe("User", () => {
  describe("create", () => {
    it("新しいユーザーを作成する", async () => {
      const user = await User.create(
        "Test User",
        "test@example.com",
        "StrongPassword123!",
      );

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe("string");
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBeDefined();
      expect(user.role).toBe("member");
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt).toEqual(user.updatedAt);
    });

    it("admin roleでユーザーを作成する", async () => {
      const user = await User.create(
        "Admin User",
        "admin@example.com",
        "StrongPassword123!",
        "admin",
      );

      expect(user.role).toBe("admin");
    });

    it("異なるユーザーは異なるIDを持つ", async () => {
      const user1 = await User.create(
        "User 1",
        "user1@example.com",
        "StrongPassword123!",
      );
      const user2 = await User.create(
        "User 2",
        "user2@example.com",
        "StrongPassword123!",
      );

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe("restore", () => {
    it("既存のユーザーデータからユーザーを復元する", () => {
      const id = "test-id";
      const name = "Test User";
      const email = "test@example.com";
      const password = "hashedPassword";
      const role = "admin";
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");

      const user = User.restore(
        id,
        name,
        email,
        password,
        role,
        createdAt,
        updatedAt,
      );

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.password.hashedValue).toBe(password);
      expect(user.role).toBe(role);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe("verifyPassword", () => {
    it("正しいパスワードで検証が成功する", async () => {
      const user = await User.create(
        "Test User",
        "test@example.com",
        "StrongPassword123!",
      );

      const isValid = await user.verifyPassword("StrongPassword123!");
      expect(isValid).toBe(true);
    });

    it("間違ったパスワードで検証が失敗する", async () => {
      const user = await User.create(
        "Test User",
        "test@example.com",
        "StrongPassword123!",
      );

      const isValid = await user.verifyPassword("WrongPassword123!");
      expect(isValid).toBe(false);
    });
  });

  describe("getters", () => {
    it("全てのプロパティにアクセスできる", async () => {
      const user = await User.create(
        "Test User",
        "test@example.com",
        "StrongPassword123!",
      );

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBeDefined();
      expect(user.role).toBe("member");
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});
