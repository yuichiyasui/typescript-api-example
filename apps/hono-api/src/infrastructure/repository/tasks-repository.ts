import type { ITasksRepository } from "../../domain/interface/tasks-repository.js";
import { Task } from "../../domain/task.js";

export class TasksRepository implements ITasksRepository {
  // TODO: 実際のDBクライアントに置き換える
  constructor(private readonly db: unknown) {}

  async findAll(): Promise<Task[]> {
    // Simulate fetching tasks from a database or external source
    return [
      Task.restore(1, "Task 1"),
      Task.restore(2, "Task 2"),
      Task.restore(3, "Task 3"),
    ];
  }
}
