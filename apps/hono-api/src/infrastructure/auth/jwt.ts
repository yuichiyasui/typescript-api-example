import jwt from "jsonwebtoken";
import { z } from "zod";

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

const TokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

const RefreshTokenPayloadSchema = z.object({
  userId: z.string(),
  tokenVersion: z.number(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_EXPIRES_IN = "30m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

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
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const validatedPayload = TokenPayloadSchema.parse(decoded);
    return {
      userId: validatedPayload.userId,
      email: validatedPayload.email,
      role: validatedPayload.role,
    };
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const validatedPayload = RefreshTokenPayloadSchema.parse(decoded);
    return {
      userId: validatedPayload.userId,
      tokenVersion: validatedPayload.tokenVersion,
    };
  } catch {
    return null;
  }
};
