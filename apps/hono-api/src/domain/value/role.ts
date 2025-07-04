export const UserRoleConstants = {
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
} as const;

export type UserRoleConstant =
  (typeof UserRoleConstants)[keyof typeof UserRoleConstants];

export const UserRoleDbValues = {
  MEMBER: 1,
  ADMIN: 2,
} as const;

export type UserRoleDbValue =
  (typeof UserRoleDbValues)[keyof typeof UserRoleDbValues];

export class UserRole {
  private constructor(private readonly _value: UserRoleConstant) {}

  static fromDbValue(dbValue: UserRoleDbValue): UserRole {
    switch (dbValue) {
      case UserRoleDbValues.MEMBER:
        return new UserRole(UserRoleConstants.MEMBER);
      case UserRoleDbValues.ADMIN:
        return new UserRole(UserRoleConstants.ADMIN);
      default:
        throw new Error(`Invalid role database value: ${dbValue}`);
    }
  }

  static fromString(value: UserRoleConstant): UserRole {
    if (!Object.values(UserRoleConstants).includes(value)) {
      throw new Error(`Invalid role value: ${value}`);
    }
    return new UserRole(value);
  }

  static member(): UserRole {
    return new UserRole(UserRoleConstants.MEMBER);
  }

  static admin(): UserRole {
    return new UserRole(UserRoleConstants.ADMIN);
  }

  get value(): UserRoleConstant {
    return this._value;
  }

  get dbValue(): UserRoleDbValue {
    switch (this._value) {
      case UserRoleConstants.MEMBER:
        return UserRoleDbValues.MEMBER;
      case UserRoleConstants.ADMIN:
        return UserRoleDbValues.ADMIN;
    }
  }

  equals(other: UserRole): boolean {
    return this._value === other._value;
  }

  isMember(): boolean {
    return this._value === UserRoleConstants.MEMBER;
  }

  isAdmin(): boolean {
    return this._value === UserRoleConstants.ADMIN;
  }

  static isAdminRole(roleValue: string | number): boolean {
    if (typeof roleValue === "number") {
      return roleValue === UserRoleDbValues.ADMIN;
    }
    return roleValue === UserRoleConstants.ADMIN;
  }
}
