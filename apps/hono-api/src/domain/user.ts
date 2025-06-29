import { nanoid } from "nanoid";

export type UserRole = "admin" | "member";

export class User {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _password: string,
    private readonly _role: UserRole,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static create(
    name: string,
    email: string,
    hashedPassword: string,
    role: UserRole = "member",
  ): User {
    const now = new Date();
    return new User(nanoid(), name, email, hashedPassword, role, now, now);
  }

  static restore(
    id: string,
    name: string,
    email: string,
    password: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(id, name, email, password, role, createdAt, updatedAt);
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}