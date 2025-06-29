import type { ITasksRepository } from "../../domain/interface/tasks-repository.js";
import { Task } from "../../domain/task.js";
import { db } from "../database/connection.js";
import { tasks } from "../database/schema.js";

export class TasksRepository implements ITasksRepository {
  async findAll(): Promise<Task[]> {
    const rows = await db.select().from(tasks);
    return rows.map((row) => Task.restore(row.id, row.name));
  }
}
