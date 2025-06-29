import type { User } from "../user.js";

export interface IUsersRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
