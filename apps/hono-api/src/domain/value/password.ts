import { hash, compare } from "bcrypt";

const SALT_ROUNDS = 12;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Password {
  private constructor(private readonly _hashedValue: string) {}

  static async create(plainPassword: string): Promise<Password> {
    const validation = this.validate(plainPassword);
    if (!validation.isValid) {
      throw new Error(`Invalid password: ${validation.errors.join(", ")}`);
    }

    const hashedPassword = await hash(plainPassword, SALT_ROUNDS);
    return new Password(hashedPassword);
  }

  static restore(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be no more than 128 characters long");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async verify(plainPassword: string): Promise<boolean> {
    return compare(plainPassword, this._hashedValue);
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  equals(other: Password): boolean {
    return this._hashedValue === other._hashedValue;
  }
}
