import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { IProjectsRepository } from "../../domain/interface/projects-repository.js";
import { Project } from "../../domain/project.js";
import { db } from "../database/connection.js";
import { projectMembers, projects } from "../database/schema.js";

export class ProjectsRepository implements IProjectsRepository {
  async create(project: Project): Promise<Project> {
    await db.transaction(async (tx) => {
      await tx.insert(projects).values({
        id: project.id,
        name: project.name,
        createdBy: project.createdBy,
      });

      await tx.insert(projectMembers).values({
        id: nanoid(),
        projectId: project.id,
        userId: project.createdBy,
      });
    });

    return project;
  }

  async findById(id: string): Promise<Project | null> {
    const rows = await db.select().from(projects).where(eq(projects.id, id));
    if (rows.length === 0) return null;

    const row = rows[0]!;
    return Project.restore(row.id, row.name, row.createdBy);
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        createdBy: projects.createdBy,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    return rows.map((row) => Project.restore(row.id, row.name, row.createdBy));
  }
}