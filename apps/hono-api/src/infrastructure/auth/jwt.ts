import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { env } from "../env.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_EXPIRES_IN = "30m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const generateTokenPair = (
  payload: TokenPayload,
  tokenVersion: number = 1,
): TokenPair => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

  const refreshPayload: RefreshTokenPayload = {
    userId: payload.userId,
    tokenVersion,
  };

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload &
      RefreshTokenPayload;
    return {
      userId: decoded.userId,
      tokenVersion: decoded.tokenVersion,
    };
  } catch {
    return null;
  }
};
