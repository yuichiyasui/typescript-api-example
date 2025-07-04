import { nanoid } from "nanoid";

export class Project {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _createdBy: string,
  ) {}

  static create(name: string, createdBy: string): Project {
    return new Project(nanoid(), name, createdBy);
  }

  static restore(id: string, name: string, createdBy: string): Project {
    return new Project(id, name, createdBy);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get createdBy(): string {
    return this._createdBy;
  }
}