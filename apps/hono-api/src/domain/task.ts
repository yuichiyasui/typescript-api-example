import { nanoid } from "nanoid";

export class Task {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
  ) {}

  static create(name: string): Task {
    return new Task(nanoid(), name);
  }

  static restore(id: string, name: string): Task {
    return new Task(id, name);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}
