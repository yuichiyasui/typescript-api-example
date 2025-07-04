import type { IProjectsRepository } from "../../domain/interface/projects-repository.js";
import { Project } from "../../domain/project.js";

type Dependencies = {
  projectsRepository: IProjectsRepository;
};

export const createProject = async (
  deps: Dependencies,
  name: string,
  createdBy: string,
) => {
  const project = Project.create(name, createdBy);
  return deps.projectsRepository.create(project);
};