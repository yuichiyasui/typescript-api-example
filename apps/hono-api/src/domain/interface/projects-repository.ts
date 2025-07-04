import type { Project } from "../project.js";

export interface PaginationOptions {
  offset: number;
  limit: number;
}

export interface IProjectsRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<Project[]>;
  countByUserId(userId: string): Promise<number>;
}
