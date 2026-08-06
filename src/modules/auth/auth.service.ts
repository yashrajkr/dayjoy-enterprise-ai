import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError, ValidationError, UnauthorizedError } from '../../middleware/errorHandler';

export interface RegisterInput { email: string; password: string; firstName?: string; lastName?: string; phone?: string; tenantId: string; }
export interface LoginInput { email: string; password: string; }
export interface TokenPayload { userId: string; tenantId: string; email: string; }
export interface AuthResponse { user: { id: string; email: string; firstName?: string; lastName?: string; tenantId: string; }; accessToken: string; refreshToken: string; }

async function hashPassword(password: string): Promise<string> { return bcrypt.hash(password, 12); }
async function verifyPassword(password: string, hash: string): Promise<boolean> { return bcrypt.compare(password, hash); }
function generateAccessToken(payload: TokenPayload): string { return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn }); }
function generateRefreshToken(payload: TokenPayload): string { return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' }); }
export function verifyToken(token: string): TokenPayload {
  try { return jwt.verify(token, config.jwtSecret) as TokenPayload; }
  catch { throw new UnauthorizedError('Invalid token'); }
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) throw new ValidationError('Invalid email');
  if (input.password.length < 8) throw new ValidationError('Password must be 8+ chars');
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('User exists', 409);
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, password_hash: passwordHash, first_name: input.firstName, last_name: input.lastName, phone: input.phone, tenant_id: input.tenantId, status: 'ACTIVE' },
  });
  const payload: TokenPayload = { userId: user.id, tenantId: input.tenantId, email: user.email };
  return { user: { id: user.id, email: user.email, firstName: user.first_name ?? undefined, lastName: user.last_name ?? undefined, tenantId: user.tenant_id }, accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) };
}

export async function login(input: LoginInput, tenantId: string): Promise<AuthResponse> {
  const user = await prisma.user.findFirst({ where: { email: input.email, tenant_id: tenantId } });
  if (!user || user.status !== 'ACTIVE' || !user.password_hash) throw new UnauthorizedError('Invalid credentials');
  const valid = await verifyPassword(input.password, user.password_hash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');
  const payload: TokenPayload = { userId: user.id, tenantId: user.tenant_id, email: user.email };
  return { user: { id: user.id, email: user.email, firstName: user.first_name ?? undefined, lastName: user.last_name ?? undefined, tenantId: user.tenant_id }, accessToken: generateAccessToken(payload), refreshToken: generateRefreshToken(payload) };
}
