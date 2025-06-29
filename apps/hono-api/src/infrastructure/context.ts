import type { ITasksRepository } from "../domain/interface/tasks-repository.js";
import type { IUsersRepository } from "../domain/interface/users-repository.js";

import type { Logger } from "./logger.js";

export type Context = {
  Variables: {
    tasksRepository: ITasksRepository;
    usersRepository: IUsersRepository;
    logger: Logger;
    traceId: string;
  };
};
