import type { ITasksRepository } from "../../domain/interface/tasks-repository.js";

type Dependencies = {
  tasksRepository: ITasksRepository;
};

export const listTasks = (deps: Dependencies) => {
  return deps.tasksRepository.findAll();
};
