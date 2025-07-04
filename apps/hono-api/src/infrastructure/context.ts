import type { IProjectsRepository } from "../domain/interface/projects-repository.js";
import type { ITasksRepository } from "../domain/interface/tasks-repository.js";
import type { IUsersRepository } from "../domain/interface/users-repository.js";

import type { Logger } from "./logger.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export type Context = {
  Variables: {
    tasksRepository: ITasksRepository;
    usersRepository: IUsersRepository;
    projectsRepository: IProjectsRepository;
    logger: Logger;
    traceId: string;
    user?: AuthenticatedUser;
  };
};
