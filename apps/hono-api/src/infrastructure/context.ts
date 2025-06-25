import type { ITasksRepository } from "../domain/interface/tasks-repository.js";

export type Context = {
  Variables: {
    tasksRepository: ITasksRepository;
  };
};
