import type { IUsersRepository } from "../../domain/interface/users-repository.js";
import { User } from "../../domain/user.js";
import { hashPassword, validatePassword } from "../../infrastructure/password.js";

type Dependencies = {
  usersRepository: IUsersRepository;
};

export interface RegisterUserParams {
  name: string;
  email: string;
  password: string;
}

export type RegisterUserResponse =
  | {
      success: true;
      userId: string;
    }
  | {
      success: false;
      errors: string[];
    };

export const registerUser = async (
  deps: Dependencies,
  params: RegisterUserParams,
): Promise<RegisterUserResponse> => {
  const { name, email, password } = params;

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      errors: passwordValidation.errors,
    };
  }

  const existingUser = await deps.usersRepository.findByEmail(email);
  if (existingUser) {
    return {
      success: false,
      errors: ["User with this email already exists"],
    };
  }

  const hashedPassword = await hashPassword(password);
  const user = User.create(name, email, hashedPassword);

  await deps.usersRepository.save(user);

  return {
    success: true,
    userId: user.id,
  };
};