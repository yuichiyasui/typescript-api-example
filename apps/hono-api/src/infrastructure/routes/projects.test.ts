import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectsRoutes } from "./projects.js";
import type { Context } from "../context.js";

// JWTモジュールをモック
vi.mock("../auth/jwt.js", () => ({
  verifyAccessToken: vi.fn().mockReturnValue({
    userId: "user1",
    email: "test@example.com",
    role: "user",
  }),
}));

describe("Projects Routes", () => {
  let app: Hono<Context>;
  let mockProjectsRepository: any;
  let logger: any;

  beforeEach(() => {
    app = new Hono<Context>();
    mockProjectsRepository = {
      findByUserId: vi.fn(),
      countByUserId: vi.fn(),
    };
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("projectsRepository", mockProjectsRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/projects", projectsRoutes);
  });

  describe("GET /projects", () => {
    it("デフォルトのページネーション（page=1, limit=10）でプロジェクト一覧を取得できる", async () => {
      const mockProjects = [
        {
          id: "project1",
          name: "Project 1",
          createdBy: "user1",
        },
        {
          id: "project2",
          name: "Project 2",
          createdBy: "user1",
        },
      ];
      mockProjectsRepository.findByUserId.mockReturnValue(mockProjects);
      mockProjectsRepository.countByUserId.mockReturnValue(2);

      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data).toEqual({
        projects: mockProjects,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 0, limit: 10 },
      );
      expect(mockProjectsRepository.countByUserId).toHaveBeenCalledWith(
        "user1",
      );
    });

    it("カスタムページネーション（page=2, limit=5）でプロジェクト一覧を取得できる", async () => {
      const mockProjects = [
        {
          id: "project6",
          name: "Project 6",
          createdBy: "user1",
        },
      ];
      mockProjectsRepository.findByUserId.mockReturnValue(mockProjects);
      mockProjectsRepository.countByUserId.mockReturnValue(11);

      const response = await app.request("/projects?page=2&limit=5", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data).toEqual({
        projects: mockProjects,
        pagination: {
          page: 2,
          limit: 5,
          total: 11,
          totalPages: 3,
        },
      });
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 5, limit: 5 },
      );
      expect(mockProjectsRepository.countByUserId).toHaveBeenCalledWith(
        "user1",
      );
    });

    it("page=0の場合、1に正規化される", async () => {
      mockProjectsRepository.findByUserId.mockReturnValue([]);
      mockProjectsRepository.countByUserId.mockReturnValue(0);

      const response = await app.request("/projects?page=0", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data.pagination.page).toBe(1);
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 0, limit: 10 },
      );
    });

    it("負の値のpageの場合、1に正規化される", async () => {
      mockProjectsRepository.findByUserId.mockReturnValue([]);
      mockProjectsRepository.countByUserId.mockReturnValue(0);

      const response = await app.request("/projects?page=-1", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data.pagination.page).toBe(1);
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 0, limit: 10 },
      );
    });

    it("limit=0の場合、10に正規化される", async () => {
      mockProjectsRepository.findByUserId.mockReturnValue([]);
      mockProjectsRepository.countByUserId.mockReturnValue(0);

      const response = await app.request("/projects?limit=0", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data.pagination.limit).toBe(10);
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 0, limit: 10 },
      );
    });

    it("limitが100を超える場合、100に制限される", async () => {
      mockProjectsRepository.findByUserId.mockReturnValue([]);
      mockProjectsRepository.countByUserId.mockReturnValue(0);

      const response = await app.request("/projects?limit=150", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data.pagination.limit).toBe(100);
      expect(mockProjectsRepository.findByUserId).toHaveBeenCalledWith(
        "user1",
        { offset: 0, limit: 100 },
      );
    });

    it("プロジェクトが存在しない場合、空の配列を返す", async () => {
      mockProjectsRepository.findByUserId.mockReturnValue([]);
      mockProjectsRepository.countByUserId.mockReturnValue(0);

      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { pagination: { page: number; limit: number } };
      expect(data).toEqual({
        projects: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it("リポジトリでエラーが発生した場合、500エラーを返す", async () => {
      mockProjectsRepository.findByUserId.mockRejectedValue(
        new Error("Database error"),
      );

      const response = await app.request("/projects", {
        method: "GET",
        headers: {
          Cookie: "accessToken=dummy-token",
        },
      });

      expect(response.status).toBe(500);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
