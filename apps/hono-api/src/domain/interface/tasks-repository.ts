import type { Task } from "../task.js";

export interface ITasksRepository {
  findAll(): Promise<Task[]>;
}
