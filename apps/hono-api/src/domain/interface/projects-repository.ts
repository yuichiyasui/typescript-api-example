import type { Project } from "../project.js";

export interface IProjectsRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
}