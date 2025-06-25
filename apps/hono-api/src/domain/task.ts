export class Task {
  constructor(
    private readonly _id: number,
    private readonly _name: string,
  ) {}

  static create(): Task {
    // TODO: 自動採番する
    return new Task(0, "New Task");
  }

  static restore(id: number, name: string): Task {
    return new Task(id, name);
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
}
