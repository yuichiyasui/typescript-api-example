import { eq, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import type {
  IProjectsRepository,
  PaginationOptions,
} from "../../domain/interface/projects-repository.js";
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

  async findByUserId(
    userId: string,
    options?: PaginationOptions,
  ): Promise<Project[]> {
    const baseQuery = db
      .select({
        id: projects.id,
        name: projects.name,
        createdBy: projects.createdBy,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    const rows = options
      ? await baseQuery.limit(options.limit).offset(options.offset)
      : await baseQuery;

    return rows.map((row) => Project.restore(row.id, row.name, row.createdBy));
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    return result[0]?.count ?? 0;
  }
}
