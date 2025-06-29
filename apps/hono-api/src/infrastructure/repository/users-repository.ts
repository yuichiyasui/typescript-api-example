import { eq } from "drizzle-orm";

import type { IUsersRepository } from "../../domain/interface/users-repository.js";
import { User, type UserRole } from "../../domain/user.js";
import { db } from "../database/connection.js";
import { users } from "../database/schema.js";

export class UsersRepository implements IUsersRepository {
  async save(user: User): Promise<void> {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password.hashedValue,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.email, email));

    const row = rows[0];
    if (!row) {
      return null;
    }

    return User.restore(
      row.id,
      row.name,
      row.email,
      row.password,
      row.role as UserRole,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id));

    const row = rows[0];
    if (!row) {
      return null;
    }

    return User.restore(
      row.id,
      row.name,
      row.email,
      row.password,
      row.role as UserRole,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    );
  }
}
