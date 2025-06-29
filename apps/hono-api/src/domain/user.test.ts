import { describe, expect, it } from "vitest";

import { User } from "./user.js";

describe("User", () => {
  describe("create", () => {
    it("新しいユーザーを作成する", () => {
      const user = User.create("Test User", "test@example.com", "hashedPassword");

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe("string");
      expect(user.id.length).toBeGreaterThan(0);
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBe("hashedPassword");
      expect(user.role).toBe("member");
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt).toEqual(user.updatedAt);
    });

    it("admin roleでユーザーを作成する", () => {
      const user = User.create("Admin User", "admin@example.com", "hashedPassword", "admin");

      expect(user.role).toBe("admin");
    });

    it("異なるユーザーは異なるIDを持つ", () => {
      const user1 = User.create("User 1", "user1@example.com", "hashedPassword");
      const user2 = User.create("User 2", "user2@example.com", "hashedPassword");

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

      const user = User.restore(id, name, email, password, role, createdAt, updatedAt);

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.password).toBe(password);
      expect(user.role).toBe(role);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });
  });

  describe("getters", () => {
    it("全てのプロパティにアクセスできる", () => {
      const user = User.create("Test User", "test@example.com", "hashedPassword");

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.password).toBe("hashedPassword");
      expect(user.role).toBe("member");
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});