import type { ITasksRepository } from "../domain/interface/tasks-repository.js";

import type { Logger } from "./logger.js";

export type Context = {
  Variables: {
    tasksRepository: ITasksRepository;
    logger: Logger;
    traceId: string;
  };
};
