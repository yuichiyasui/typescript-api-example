import type {
  IProjectsRepository,
  PaginationOptions,
} from "../../domain/interface/projects-repository.js";
import { Project } from "../../domain/project.js";

type Dependencies = {
  projectsRepository: IProjectsRepository;
};

export interface PaginatedProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createProject = async (
  deps: Dependencies,
  name: string,
  createdBy: string,
) => {
  const project = Project.create(name, createdBy);
  return deps.projectsRepository.create(project);
};

export const getProjectsByUserId = async (
  deps: Dependencies,
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedProjectsResponse> => {
  const validatedPage = Math.max(1, page);
  const validatedLimit = Math.min(100, Math.max(1, limit));
  const offset = (validatedPage - 1) * validatedLimit;

  const paginationOptions: PaginationOptions = {
    offset,
    limit: validatedLimit,
  };

  const [projects, total] = await Promise.all([
    deps.projectsRepository.findByUserId(userId, paginationOptions),
    deps.projectsRepository.countByUserId(userId),
  ]);

  const totalPages = Math.ceil(total / validatedLimit);

  return {
    projects,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages,
    },
  };
};
