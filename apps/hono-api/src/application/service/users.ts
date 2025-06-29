import type { IUsersRepository } from "../../domain/interface/users-repository.js";
import { User } from "../../domain/user.js";
import { Password } from "../../domain/value/password.js";
import type { UserRoleConstant } from "../../domain/value/role.js";
import {
  generateTokenPair,
  type TokenPair,
} from "../../infrastructure/auth/jwt.js";

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

  const passwordValidation = Password.validate(password);
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

  const user = await User.create(name, email, password);

  await deps.usersRepository.save(user);

  return {
    success: true,
    userId: user.id,
  };
};

export interface LoginUserParams {
  email: string;
  password: string;
}

export type LoginUserResponse =
  | {
      success: true;
      tokens: TokenPair;
      user: {
        id: string;
        name: string;
        email: string;
        role: UserRoleConstant;
      };
    }
  | {
      success: false;
      errors: string[];
    };

export const loginUser = async (
  deps: Dependencies,
  params: LoginUserParams,
): Promise<LoginUserResponse> => {
  const { email, password } = params;

  const user = await deps.usersRepository.findByEmail(email);
  if (!user) {
    return {
      success: false,
      errors: ["メールアドレスまたはパスワードが正しくありません"],
    };
  }

  const isValidPassword = await user.verifyPassword(password);
  if (!isValidPassword) {
    return {
      success: false,
      errors: ["メールアドレスまたはパスワードが正しくありません"],
    };
  }

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.roleValue,
  });

  return {
    success: true,
    tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleValue as UserRoleConstant,
    },
  };
};
