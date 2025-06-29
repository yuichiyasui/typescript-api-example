import { nanoid } from "nanoid";

import { Password } from "./value/password.js";
import { UserRole, type UserRoleDbValue } from "./value/role.js";

export class User {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _password: Password,
    private readonly _role: UserRole,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static async create(
    name: string,
    email: string,
    plainPassword: string,
    role: UserRole = UserRole.member(),
  ): Promise<User> {
    const now = new Date();
    const password = await Password.create(plainPassword);
    return new User(nanoid(), name, email, password, role, now, now);
  }

  static restore(
    id: string,
    name: string,
    email: string,
    hashedPassword: string,
    roleDbValue: UserRoleDbValue,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    const password = Password.restore(hashedPassword);
    const role = UserRole.fromDbValue(roleDbValue);
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

  get password(): Password {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get roleValue(): string {
    return this._role.value;
  }

  get roleDbValue(): UserRoleDbValue {
    return this._role.dbValue;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this._password.verify(plainPassword);
  }
}
